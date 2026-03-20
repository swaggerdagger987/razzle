"""
analytics.py -- Core analytical dashboards.

Heatmaps, stat leaders, scarcity, breakout candidates, buy/sell,
stat explorer, aging curves, weekly heatmap, target distribution,
matchup heatmap, usage trends, year-over-year, air yards, red zone.
"""

import logging
import math  # noqa: F401 — used by some callers transitively
from collections import defaultdict

from ..db import get_db

logger = logging.getLogger("razzle.live_data.analytics")
from .core import (
    FANTASY_POSITIONS,
    ABBREV_TO_TEAM,
    _safe_div,
    _safe_int,
    _STAT_SUM_COLS,
    _cached,
    _CACHE_TTL_STABLE,
    _current_nfl_season,
    _enrich_with_rate_metrics,
    _efficiency_grade,
    compute_trade_value,
)


# ---------------------------------------------------------------------------
# Scarcity tier definitions (NFL)
# ---------------------------------------------------------------------------

_SCARCITY_TIERS = {
    "QB": [
        {"label": "Elite", "start": 1, "end": 6},
        {"label": "Starter", "start": 7, "end": 12},
        {"label": "Depth", "start": 13, "end": 36},
    ],
    "RB": [
        {"label": "Bellcow", "start": 1, "end": 12},
        {"label": "Starter", "start": 13, "end": 24},
        {"label": "Depth", "start": 25, "end": 48},
    ],
    "WR": [
        {"label": "Alpha", "start": 1, "end": 12},
        {"label": "Starter", "start": 13, "end": 24},
        {"label": "Depth", "start": 25, "end": 48},
    ],
    "TE": [
        {"label": "Elite", "start": 1, "end": 6},
        {"label": "Starter", "start": 7, "end": 12},
        {"label": "Depth", "start": 13, "end": 24},
    ],
}

_SCARCITY_ANNOTATIONS = {
    "QB": {6: "elite tier ends", 12: "starter cutoff"},
    "RB": {12: "bellcow tier ends", 24: "starter cutoff"},
    "WR": {12: "alpha tier ends", 24: "starter cutoff"},
    "TE": {6: "elite tier ends", 12: "starter cutoff"},
}


# ---------------------------------------------------------------------------
# Positional Heat Maps
# ---------------------------------------------------------------------------

# Stat groups per position -- each stat has (sql_expression_or_key, display_label, higher_is_better)
_HEATMAP_STATS = {
    "QB": {
        "production": [
            ("ppg", "PPG", True),
            ("passing_yards", "Pass Yds", True),
            ("passing_tds", "Pass TD", True),
            ("rushing_yards", "Rush Yds", True),
            ("touchdowns", "Total TD", True),
            ("turnovers", "TO", False),
        ],
        "efficiency": [
            ("comp_pct", "CMP%", True),
            ("yards_per_attempt", "Y/A", True),
            ("td_rate", "TD%", True),
            ("int_rate", "INT%", False),
            ("passing_epa", "EPA", True),
            ("dakota", "DAKOTA", True),
        ],
        "usage": [
            ("games", "GP", True),
            ("attempts", "Att", True),
            ("carries", "Rush", True),
            ("completions", "CMP", True),
            ("ppg", "PPG", True),
            ("fantasy_points_ppr", "Total Pts", True),
        ],
    },
    "RB": {
        "production": [
            ("ppg", "PPG", True),
            ("rushing_yards", "Rush Yds", True),
            ("rushing_tds", "Rush TD", True),
            ("receptions", "Rec", True),
            ("receiving_yards", "Rec Yds", True),
            ("touchdowns", "Total TD", True),
        ],
        "efficiency": [
            ("yards_per_carry", "YPC", True),
            ("yards_per_reception", "Y/Rec", True),
            ("catch_rate", "Catch%", True),
            ("rushing_epa", "Rush EPA", True),
            ("receiving_epa", "Rec EPA", True),
            ("racr", "RACR", True),
        ],
        "usage": [
            ("games", "GP", True),
            ("carries", "Carries", True),
            ("targets", "Targets", True),
            ("target_share", "Tgt Share", True),
            ("snap_pct", "Snap%", True),
            ("fantasy_points_ppr", "Total Pts", True),
        ],
    },
    "WR": {
        "production": [
            ("ppg", "PPG", True),
            ("receiving_yards", "Rec Yds", True),
            ("receiving_tds", "Rec TD", True),
            ("receptions", "Rec", True),
            ("targets", "Targets", True),
            ("touchdowns", "Total TD", True),
        ],
        "efficiency": [
            ("yards_per_reception", "Y/Rec", True),
            ("yards_per_target", "Y/Tgt", True),
            ("catch_rate", "Catch%", True),
            ("receiving_epa", "Rec EPA", True),
            ("racr", "RACR", True),
            ("wopr", "WOPR", True),
        ],
        "usage": [
            ("games", "GP", True),
            ("targets", "Targets", True),
            ("target_share", "Tgt Share", True),
            ("air_yards_share", "Air Yds Share", True),
            ("snap_pct", "Snap%", True),
            ("fantasy_points_ppr", "Total Pts", True),
        ],
    },
    "TE": {
        "production": [
            ("ppg", "PPG", True),
            ("receiving_yards", "Rec Yds", True),
            ("receiving_tds", "Rec TD", True),
            ("receptions", "Rec", True),
            ("targets", "Targets", True),
            ("touchdowns", "Total TD", True),
        ],
        "efficiency": [
            ("yards_per_reception", "Y/Rec", True),
            ("yards_per_target", "Y/Tgt", True),
            ("catch_rate", "Catch%", True),
            ("receiving_epa", "Rec EPA", True),
            ("racr", "RACR", True),
            ("wopr", "WOPR", True),
        ],
        "usage": [
            ("games", "GP", True),
            ("targets", "Targets", True),
            ("target_share", "Tgt Share", True),
            ("air_yards_share", "Air Yds Share", True),
            ("snap_pct", "Snap%", True),
            ("fantasy_points_ppr", "Total Pts", True),
        ],
    },
}


def fetch_heatmap(position="WR", group="production", season=None):
    """Return top 25 players at position with percentile rankings across key stats.

    Returns:
        {
            players: [{name, team, stats: {stat_key: {value, percentile}}}],
            stat_keys: [ordered stat keys],
            stat_labels: {key: display_label},
            higher_is_better: {key: bool}
        }
    """
    position = position.strip().upper()
    if position not in FANTASY_POSITIONS:
        position = "WR"
    group = group.strip().lower()
    if group not in ("production", "efficiency", "usage"):
        group = "production"

    stat_defs = _HEATMAP_STATS[position][group]
    stat_keys = [s[0] for s in stat_defs]
    stat_labels = {s[0]: s[1] for s in stat_defs}
    higher_is_better = {s[0]: s[2] for s in stat_defs}

    def _query():
        nonlocal season
        with get_db() as conn:

            # Determine season
            if not season:
                row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
                season = row[0] if row and row[0] else _current_nfl_season()

            # Fetch all players at this position with aggregated season stats
            rows = conn.execute(f"""
                SELECT
                    p.player_id,
                    p.full_name,
                    p.team,
                    p.position,
                    COUNT(DISTINCT s.week) as games,
                    {_STAT_SUM_COLS}
                FROM players p
                JOIN player_week_stats s ON p.player_id = s.player_id
                WHERE p.position = ?
                  AND s.season = ?
                  AND s.season_type = 'regular'
                  AND s.fantasy_points_ppr IS NOT NULL
                GROUP BY p.player_id
                HAVING games >= 4
                ORDER BY fantasy_points_ppr DESC
            """, (position, season)).fetchall()

            if not rows:
                return {"players": [], "stat_keys": stat_keys, "stat_labels": stat_labels, "higher_is_better": higher_is_better}

            # Build player dicts with derived stats
            all_players = []
            for r in rows:
                d = dict(r)
                games = d["games"] or 1
                ppr = d.get("fantasy_points_ppr") or 0
                d["ppg"] = round(ppr / games, 1)
                d["comp_pct"] = _safe_div((d.get("completions") or 0) * 100, d.get("attempts"), 1)
                d["yards_per_attempt"] = _safe_div(d.get("passing_yards") or 0, d.get("attempts"), 1)
                d["td_rate"] = _safe_div((d.get("passing_tds") or 0) * 100, d.get("attempts"), 1)
                d["int_rate"] = _safe_div((d.get("interceptions") or 0) * 100, d.get("attempts"), 1)
                d["yards_per_carry"] = _safe_div(d.get("rushing_yards") or 0, d.get("carries"), 1)
                d["yards_per_reception"] = _safe_div(d.get("receiving_yards") or 0, d.get("receptions"), 1)
                d["yards_per_target"] = _safe_div(d.get("receiving_yards") or 0, d.get("targets"), 1)
                d["catch_rate"] = _safe_div((d.get("receptions") or 0) * 100, d.get("targets"), 1)
                d["snap_pct"] = None  # will be filled from rate metrics
                all_players.append(d)

            # Enrich with rate metrics from player_week_metrics
            _enrich_with_rate_metrics(conn, all_players, season=season)

            # Compute percentiles within position group for each stat
            # First, collect all values for each stat (exclude None)
            stat_values = {key: [] for key in stat_keys}
            for p in all_players:
                for key in stat_keys:
                    val = p.get(key)
                    if val is not None:
                        stat_values[key].append(val)

            # Sort values for percentile computation
            for key in stat_keys:
                stat_values[key].sort()

            def percentile_of(val, sorted_vals):
                """Compute percentile rank of val within sorted_vals."""
                if not sorted_vals or val is None:
                    return None
                n = len(sorted_vals)
                count_below = sum(1 for v in sorted_vals if v < val)
                count_equal = sum(1 for v in sorted_vals if v == val)
                pct = round((count_below + count_equal * 0.5) / n * 100, 1)
                return pct

            # Build top 25 output (already sorted by PPR desc)
            top_25 = all_players[:25]
            players_out = []
            for p in top_25:
                stats = {}
                for key in stat_keys:
                    val = p.get(key)
                    pct = percentile_of(val, stat_values[key])
                    # For "lower is better" stats, invert the percentile
                    if pct is not None and not higher_is_better.get(key, True):
                        pct = round(100 - pct, 1)
                    stats[key] = {
                        "value": val,
                        "percentile": pct,
                    }
                players_out.append({
                    "name": p.get("full_name") or p.get("player_name") or "Unknown",
                    "team": p.get("team") or "",
                    "stats": stats,
                })

            return {
                "players": players_out,
                "stat_keys": stat_keys,
                "stat_labels": stat_labels,
                "higher_is_better": higher_is_better,
            }

    return _cached(f"heatmap:{position}:{group}:{season}", _query)


# ---------------------------------------------------------------------------
# Stat Leaders -- top performers by category
# ---------------------------------------------------------------------------

# Category definitions: (key, display_label, sql_expr, is_rate, positions)
# is_rate = True means we average per game instead of sum
# positions = None means all, otherwise tuple of positions where this stat is relevant
_LEADER_CATEGORIES = [
    ("ppg", "Fantasy PPG", "SUM(s.fantasy_points_ppr)", False, None),
    ("passing_yards", "Passing Yards", "SUM(s.passing_yards)", False, ("QB",)),
    ("passing_tds", "Passing TDs", "SUM(s.passing_tds)", False, ("QB",)),
    ("rushing_yards", "Rushing Yards", "SUM(s.rushing_yards)", False, ("QB", "RB", "WR")),
    ("rushing_tds", "Rushing TDs", "SUM(s.rushing_tds)", False, ("QB", "RB", "WR")),
    ("receiving_yards", "Receiving Yards", "SUM(s.receiving_yards)", False, ("RB", "WR", "TE")),
    ("receiving_tds", "Receiving TDs", "SUM(s.receiving_tds)", False, ("RB", "WR", "TE")),
    ("receptions", "Receptions", "SUM(s.receptions)", False, ("RB", "WR", "TE")),
    ("target_share", "Target Share %", None, True, ("RB", "WR", "TE")),
    ("yards_per_carry", "Yards Per Carry", None, True, ("QB", "RB")),
]


def fetch_stat_leaders(season=None, position=None, limit=10):
    """Return top players in each stat category for the given season."""
    limit = max(1, min(25, limit))
    pos_upper = position.strip().upper() if position else None
    if pos_upper and pos_upper not in ("QB", "RB", "WR", "TE"):
        pos_upper = None

    def _query():
        nonlocal season
        with get_db() as conn:
            # Determine season
            if not season:
                row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
                season = row[0] if row and row[0] else _current_nfl_season()

            categories = []

            for key, label, sql_expr, is_rate, positions in _LEADER_CATEGORIES:
                # Skip categories not relevant to the selected position
                if pos_upper and positions and pos_upper not in positions:
                    continue

                # Build position filter with parameterized queries
                pos_params = []
                if pos_upper:
                    pos_where = "AND p.position = ?"
                    pos_params = [pos_upper]
                elif positions:
                    placeholders = ",".join("?" for _ in positions)
                    pos_where = f"AND p.position IN ({placeholders})"
                    pos_params = list(positions)
                else:
                    pos_where = "AND p.position IN ('QB','RB','WR','TE')"
                    pos_params = []

                if key == "target_share":
                    query = f"""
                        SELECT
                            p.player_id, p.full_name, p.position, p.team,
                            p.headshot_url,
                            COUNT(DISTINCT s.week) as games,
                            AVG(m.stat_value) as stat_value
                        FROM players p
                        JOIN player_week_stats s
                            ON s.player_id = p.player_id AND s.season = ?
                        JOIN player_week_metrics m
                            ON m.player_id = p.player_id AND m.season = ? AND m.week = s.week
                            AND m.stat_key = 'target_share'
                        WHERE p.fantasy_relevant = 1
                          AND s.season_type = 'regular'
                          {pos_where}
                        GROUP BY p.player_id
                        HAVING games >= 3 AND stat_value IS NOT NULL
                        ORDER BY stat_value DESC
                        LIMIT ?
                    """
                    rows = conn.execute(query, [season, season] + pos_params + [limit]).fetchall()
                elif key == "yards_per_carry":
                    query = f"""
                        SELECT
                            p.player_id, p.full_name, p.position, p.team,
                            p.headshot_url,
                            COUNT(DISTINCT s.week) as games,
                            CASE WHEN SUM(s.carries) > 0
                                 THEN CAST(SUM(s.rushing_yards) AS REAL) / SUM(s.carries)
                                 ELSE 0 END as stat_value
                        FROM players p
                        JOIN player_week_stats s
                            ON s.player_id = p.player_id AND s.season = ?
                        WHERE p.fantasy_relevant = 1
                          AND s.season_type = 'regular'
                          {pos_where}
                        GROUP BY p.player_id
                        HAVING games >= 3 AND SUM(s.carries) >= 30
                        ORDER BY stat_value DESC
                        LIMIT ?
                    """
                    rows = conn.execute(query, [season] + pos_params + [limit]).fetchall()
                elif key == "ppg":
                    query = f"""
                        SELECT
                            p.player_id, p.full_name, p.position, p.team,
                            p.headshot_url,
                            COUNT(DISTINCT s.week) as games,
                            CAST(SUM(s.fantasy_points_ppr) AS REAL) / COUNT(DISTINCT s.week) as stat_value
                        FROM players p
                        JOIN player_week_stats s
                            ON s.player_id = p.player_id AND s.season = ?
                        WHERE p.fantasy_relevant = 1
                          AND s.season_type = 'regular'
                          {pos_where}
                        GROUP BY p.player_id
                        HAVING games >= 3
                        ORDER BY stat_value DESC
                        LIMIT ?
                    """
                    rows = conn.execute(query, [season] + pos_params + [limit]).fetchall()
                else:
                    query = f"""
                        SELECT
                            p.player_id, p.full_name, p.position, p.team,
                            p.headshot_url,
                            COUNT(DISTINCT s.week) as games,
                            {sql_expr} as stat_value
                        FROM players p
                        JOIN player_week_stats s
                            ON s.player_id = p.player_id AND s.season = ?
                        WHERE p.fantasy_relevant = 1
                          AND s.season_type = 'regular'
                          {pos_where}
                        GROUP BY p.player_id
                        HAVING games >= 3
                        ORDER BY stat_value DESC
                        LIMIT ?
                    """
                    rows = conn.execute(query, [season] + pos_params + [limit]).fetchall()

                leaders = []
                for r in rows:
                    val = r["stat_value"]
                    if val is None:
                        continue
                    if key == "target_share":
                        display_val = round(val * 100, 1) if val < 1 else round(val, 1)
                        display_str = f"{display_val}%"
                    elif key in ("ppg", "yards_per_carry"):
                        display_val = round(val, 1)
                        display_str = str(display_val)
                    else:
                        display_val = int(round(val))
                        display_str = str(display_val)

                    leaders.append({
                        "player_id": r["player_id"],
                        "full_name": r["full_name"] or "Unknown",
                        "position": r["position"] or "WR",
                        "team": r["team"] or "FA",
                        "headshot_url": r["headshot_url"] or "",
                        "stat_value": display_val,
                        "stat_display": display_str,
                        "games": r["games"],
                    })

                categories.append({
                    "key": key,
                    "label": label,
                    "leaders": leaders,
                })

            # Get available seasons (same connection)
            season_rows = conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
            seasons = [r["season"] for r in season_rows]

        return {
            "categories": categories,
            "season": season,
            "seasons": seasons,
        }

    return _cached(f"stat_leaders:{season}:{pos_upper}:{limit}", _query)


def fetch_positional_scarcity(season=None):
    """Return PPG drop-off data by position for scarcity analysis."""
    def _query():
        nonlocal season
        with get_db() as conn:
            # Determine season + available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            positions_data = {}
            for pos in ("QB", "RB", "WR", "TE"):
                limit = 48 if pos in ("RB", "WR") else 36 if pos == "QB" else 24
                query = """
                    SELECT
                        p.player_id, p.full_name, p.position, p.team,
                        p.headshot_url,
                        COUNT(DISTINCT s.week) as games,
                        CAST(SUM(s.fantasy_points_ppr) AS REAL) / COUNT(DISTINCT s.week) as ppg
                    FROM players p
                    JOIN player_week_stats s
                        ON s.player_id = p.player_id AND s.season = ?
                    WHERE p.fantasy_relevant = 1
                      AND p.position = ?
                      AND s.season_type = 'regular'
                    GROUP BY p.player_id
                    HAVING games >= 3
                    ORDER BY ppg DESC
                    LIMIT ?
                """
                rows = conn.execute(query, [season, pos, limit]).fetchall()

                players = []
                for i, r in enumerate(rows):
                    players.append({
                        "rank": i + 1,
                        "player_id": r[0],
                        "name": r[1] or "Unknown",
                        "team": r[3] or "",
                        "headshot_url": r[4] or "",
                        "games": r[5],
                        "ppg": round(r[6], 1) if r[6] else 0,
                    })

                # Compute scarcity metrics
                top_ppg = players[0]["ppg"] if players else 0
                replacement_rank = 12 if pos in ("QB", "TE") else 24
                replacement_ppg = players[replacement_rank - 1]["ppg"] if len(players) >= replacement_rank else 0
                drop_off = round(top_ppg - replacement_ppg, 1)

                # PPG at tier break points
                tier_breaks = []
                for tb in _SCARCITY_TIERS.get(pos, []):
                    end_rank = tb["end"]
                    ppg_at_break = players[end_rank - 1]["ppg"] if len(players) >= end_rank else 0
                    annotation = _SCARCITY_ANNOTATIONS.get(pos, {}).get(end_rank, "")
                    tier_breaks.append({
                        "label": tb["label"],
                        "start": tb["start"],
                        "end": end_rank,
                        "ppg_at_break": ppg_at_break,
                        "annotation": annotation,
                    })

                positions_data[pos] = {
                    "players": players,
                    "top_ppg": top_ppg,
                    "replacement_ppg": replacement_ppg,
                    "replacement_rank": replacement_rank,
                    "drop_off": drop_off,
                    "tier_breaks": tier_breaks,
                }

            # Rank positions by scarcity (highest drop-off = most scarce)
            scarcity_ranking = sorted(
                [{"position": pos, "drop_off": d["drop_off"], "top_ppg": d["top_ppg"],
                  "replacement_ppg": d["replacement_ppg"]}
                 for pos, d in positions_data.items()],
                key=lambda x: x["drop_off"],
                reverse=True,
            )

            return {
                "season": season,
                "available_seasons": available_seasons,
                "positions": positions_data,
                "scarcity_ranking": scarcity_ranking,
            }

    return _cached(f"positional_scarcity:{season}", _query)


# ---------------------------------------------------------------------------
# Breakout Candidate Finder -- opportunity vs production gap
# ---------------------------------------------------------------------------

_BREAKOUT_ANNOTATIONS = [
    "due for a leap",
    "opportunity knocking",
    "the gap is real",
    "buy low window",
    "volume is coming",
    "efficiency waiting to click",
    "usage spike incoming",
    "sleeper alert",
    "the arrow is up",
    "market inefficiency",
]


def fetch_breakout_candidates(season=None, position=None, limit=50, week=None):
    """Return players ranked by breakout potential (opportunity-production gap)."""
    def _query():
        nonlocal season
        with get_db() as conn:
            # Determine season + available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            pos_filter = ""
            week_filter = ""
            params = [season]
            _week = _safe_int(week)
            if _week > 0:
                week_filter = "AND s.week = ?"
                params.append(_week)
            if position and position.upper() in ("QB", "RB", "WR", "TE"):
                pos_filter = "AND p.position = ?"
                params.append(position.upper())

            # Get all fantasy-relevant young players with their season stats
            query = f"""
                SELECT
                    p.player_id, p.full_name, p.position, p.team, p.age,
                    p.headshot_url,
                    SUM(s.fantasy_points_ppr) as total_ppr,
                    COUNT(DISTINCT s.week) as games,
                    AVG(s.offense_pct) as avg_snap_pct,
                    SUM(s.targets) as targets,
                    SUM(s.carries) as carries,
                    SUM(s.attempts) as attempts,
                    SUM(s.receiving_air_yards) as air_yards
                FROM players p
                JOIN player_week_stats s
                    ON s.player_id = p.player_id AND s.season = ?
                WHERE p.position IN ('QB','RB','WR','TE')
                  AND p.fantasy_relevant = 1
                  AND p.age IS NOT NULL
                  AND p.age <= 27
                  AND s.season_type = 'regular'
                  {week_filter}
                  {pos_filter}
                GROUP BY p.player_id
                HAVING games >= 6
                ORDER BY total_ppr DESC
                LIMIT 500
            """
            rows = conn.execute(query, params).fetchall()

            if not rows:
                return {
                    "season": season,
                    "available_seasons": available_seasons,
                    "candidates": [],
                    "total": 0,
                }

            # Build player list with raw stats
            players = []
            for r in rows:
                games = r[7] or 1
                ppg = round((r[6] or 0) / games, 2)
                snap_pct = round(r[8] or 0, 1)
                targets = r[9] or 0
                carries = r[10] or 0
                attempts = r[11] or 0
                air_yards = r[12] or 0
                players.append({
                    "player_id": r[0],
                    "name": r[1] or "Unknown",
                    "position": r[2] or "WR",
                    "team": r[3] or "FA",
                    "age": r[4],
                    "headshot_url": r[5] or "",
                    "ppg": ppg,
                    "games": games,
                    "snap_pct": snap_pct,
                    "targets_per_game": round(targets / games, 1),
                    "carries_per_game": round(carries / games, 1),
                    "attempts_per_game": round(attempts / games, 1),
                    "air_yards_per_game": round(air_yards / games, 1),
                })

            # Fetch target_share from player_week_metrics
            pids = [p["player_id"] for p in players]
            placeholders = ",".join("?" * len(pids))
            metrics_week_filter = ""
            metrics_params = pids + [season]
            _week_m = _safe_int(week)
            if _week_m > 0:
                metrics_week_filter = "AND week = ?"
                metrics_params.append(_week_m)
            ts_rows = conn.execute(f"""
                SELECT player_id, AVG(stat_value) as avg_ts
                FROM player_week_metrics
                WHERE player_id IN ({placeholders})
                  AND season = ?
                  AND stat_key = 'target_share'
                  {metrics_week_filter}
                GROUP BY player_id
            """, metrics_params).fetchall()
            ts_lookup = {r[0]: round(r[1] * 100, 1) if r[1] else 0 for r in ts_rows}
            for p in players:
                p["target_share"] = ts_lookup.get(p["player_id"], 0)

            # Compute percentiles within each position group
            by_pos = {}
            for p in players:
                pos = p["position"]
                if pos not in by_pos:
                    by_pos[pos] = []
                by_pos[pos].append(p)

            for pos, pos_players in by_pos.items():
                n = len(pos_players)
                if n < 2:
                    for p in pos_players:
                        p["opportunity_pct"] = 50
                        p["production_pct"] = 50
                        p["rbs_score"] = 0
                    continue

                # Compute opportunity metric based on position
                for p in pos_players:
                    if pos == "QB":
                        p["_opp_raw"] = p["snap_pct"] * 0.5 + p["attempts_per_game"] * 1.5
                    elif pos == "RB":
                        p["_opp_raw"] = p["snap_pct"] * 0.4 + p["carries_per_game"] * 2.0 + p["targets_per_game"] * 3.0
                    else:
                        # WR/TE: snap% + target share + air yards
                        p["_opp_raw"] = p["snap_pct"] * 0.3 + p["target_share"] * 2.0 + p["air_yards_per_game"] * 0.1

                # Sort by opportunity and assign percentiles
                opp_sorted = sorted(pos_players, key=lambda x: x["_opp_raw"])
                for i, p in enumerate(opp_sorted):
                    p["opportunity_pct"] = round((i / (n - 1)) * 100) if n > 1 else 50

                # Sort by PPG and assign production percentiles
                ppg_sorted = sorted(pos_players, key=lambda x: x["ppg"])
                for i, p in enumerate(ppg_sorted):
                    p["production_pct"] = round((i / (n - 1)) * 100) if n > 1 else 50

                # Breakout Score = opportunity percentile - production percentile
                # Positive gap = more opportunity than production = breakout candidate
                for p in pos_players:
                    gap = p["opportunity_pct"] - p["production_pct"]
                    # Age bonus: younger = higher breakout potential
                    age_bonus = max(0, (28 - (p["age"] or 27)) * 2)
                    p["rbs_score"] = max(0, gap + age_bonus)
                    del p["_opp_raw"]

            # Flatten, sort by RBS, take top N
            all_players = []
            for pos_players in by_pos.values():
                all_players.extend(pos_players)

            all_players.sort(key=lambda x: x["rbs_score"], reverse=True)
            candidates = all_players[:limit]

            # Add rank and annotation
            for i, p in enumerate(candidates):
                p["rank"] = i + 1
                p["annotation"] = _BREAKOUT_ANNOTATIONS[i % len(_BREAKOUT_ANNOTATIONS)]

            return {
                "season": season,
                "available_seasons": available_seasons,
                "candidates": candidates,
                "total": len(candidates),
            }

    return _cached(f"breakout_candidates:{season}:{position}:{limit}:{week}", _query)


# ---------------------------------------------------------------------------
# Buy Low / Sell High -- Dynasty value mismatch finder
# ---------------------------------------------------------------------------

_EFFICIENCY_ANNOTATIONS_BUY = [
    "efficiency says undervalued",
    "production quality exceeds ranking",
    "the market is sleeping on this one",
    "better than his ADP suggests",
    "sneaky good efficiency numbers",
    "the stats say buy",
    "value mismatch detected",
    "producing above his pay grade",
    "efficiency trending the right way",
    "under the radar performer",
    "league winner territory",
    "the film doesn't lie",
    "market hasn't caught up yet",
    "quiet performer, loud stats",
    "discount dynasty asset",
]

_EFFICIENCY_ANNOTATIONS_SELL = [
    "efficiency says overvalued",
    "ranking exceeds production quality",
    "the market is too high on this one",
    "numbers trending the wrong way",
    "volume masking declining efficiency",
    "the stats say sell",
    "value mismatch detected",
    "producing below his price tag",
    "efficiency heading south",
    "sell before the cliff",
    "name value exceeding stat value",
    "the film tells a different story",
    "market hasn't adjusted yet",
    "loud name, quiet production",
    "premium dynasty price, discount stats",
]


def fetch_buy_sell_candidates(season=None, position=None, limit=15):
    """Return players split into buy-low and sell-high based on efficiency vs dynasty rank."""
    def _query():
        nonlocal season
        with get_db() as conn:
            # Determine season + available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            pos_filter = ""
            params = [season]
            if position and position.upper() in ("QB", "RB", "WR", "TE"):
                pos_filter = "AND p.position = ?"
                params.append(position.upper())

            # Get all fantasy-relevant players with season stats
            query = f"""
                SELECT
                    p.player_id, p.full_name, p.position, p.team, p.age,
                    p.headshot_url,
                    SUM(s.fantasy_points_ppr) as total_ppr,
                    COUNT(DISTINCT s.week) as games,
                    SUM(s.rushing_yards) as rush_yds,
                    SUM(s.carries) as carries,
                    SUM(s.receiving_yards) as rec_yds,
                    SUM(s.targets) as targets,
                    SUM(s.receptions) as receptions,
                    SUM(s.touchdowns) as tds,
                    SUM(s.passing_yards) as pass_yds,
                    SUM(s.attempts) as pass_att,
                    SUM(s.passing_tds) as pass_tds,
                    SUM(s.interceptions) as ints,
                    SUM(s.turnovers) as turnovers,
                    SUM(s.receiving_yards_after_catch) as yac
                FROM players p
                JOIN player_week_stats s
                    ON s.player_id = p.player_id AND s.season = ?
                WHERE p.position IN ('QB','RB','WR','TE')
                  AND p.fantasy_relevant = 1
                  AND s.season_type = 'regular'
                  {pos_filter}
                GROUP BY p.player_id
                HAVING games >= 6
                ORDER BY total_ppr DESC
                LIMIT 500
            """
            rows = conn.execute(query, params).fetchall()

            if not rows:
                return {
                    "season": season,
                    "available_seasons": available_seasons,
                    "buy_low": [],
                    "sell_high": [],
                }

            # Build player list with raw stats + dynasty value
            players = []
            for r in rows:
                games = r[7] or 1
                ppg = round((r[6] or 0) / games, 2)
                rush_yds = r[8] or 0
                carries = r[9] or 0
                rec_yds = r[10] or 0
                targets = r[11] or 0
                receptions = r[12] or 0
                tds = r[13] or 0
                pass_yds = r[14] or 0
                pass_att = r[15] or 0
                pass_tds = r[16] or 0
                ints = r[17] or 0
                turnovers = r[18] or 0
                yac = r[19] or 0
                pos = r[2] or "WR"
                age = r[4]

                # Compute dynasty value for ranking
                dynasty_val = compute_trade_value(ppg, age, pos)

                # Compute position-specific efficiency metrics
                if pos == "QB":
                    yards_per_att = round(pass_yds / pass_att, 2) if pass_att > 0 else 0
                    td_rate = round((pass_tds / pass_att) * 100, 2) if pass_att > 0 else 0
                    int_rate = round((ints / pass_att) * 100, 2) if pass_att > 0 else 0
                    eff_stats = {
                        "yards_per_att": yards_per_att,
                        "td_rate": td_rate,
                        "int_rate": int_rate,
                    }
                    # QB efficiency: high Y/A + high TD% + low INT%
                    eff_raw = yards_per_att * 8 + td_rate * 10 - int_rate * 8
                elif pos == "RB":
                    ypc = round(rush_yds / carries, 2) if carries > 0 else 0
                    yds_per_tgt = round(rec_yds / targets, 2) if targets > 0 else 0
                    touches = carries + receptions
                    td_rate = round((tds / touches) * 100, 2) if touches > 0 else 0
                    eff_stats = {
                        "yards_per_carry": ypc,
                        "yards_per_target": yds_per_tgt,
                        "td_rate": td_rate,
                    }
                    eff_raw = ypc * 10 + yds_per_tgt * 3 + td_rate * 5
                else:
                    # WR / TE
                    yds_per_tgt = round(rec_yds / targets, 2) if targets > 0 else 0
                    catch_rate = round((receptions / targets) * 100, 1) if targets > 0 else 0
                    yac_per_rec = round(yac / receptions, 2) if receptions > 0 else 0
                    td_rate = round((tds / receptions) * 100, 2) if receptions > 0 else 0
                    eff_stats = {
                        "yards_per_target": yds_per_tgt,
                        "catch_rate": catch_rate,
                        "yac_per_rec": yac_per_rec,
                        "td_rate": td_rate,
                    }
                    eff_raw = yds_per_tgt * 5 + catch_rate * 0.5 + yac_per_rec * 3 + td_rate * 4

                players.append({
                    "player_id": r[0],
                    "name": r[1] or "Unknown",
                    "position": pos,
                    "team": r[3] or "FA",
                    "age": age,
                    "headshot_url": r[5] or "",
                    "ppg": ppg,
                    "games": games,
                    "dynasty_value": dynasty_val,
                    "eff_raw": eff_raw,
                    "eff_stats": eff_stats,
                })

            # Compute percentiles within each position group
            by_pos = {}
            for p in players:
                pos = p["position"]
                if pos not in by_pos:
                    by_pos[pos] = []
                by_pos[pos].append(p)

            for pos, pos_players in by_pos.items():
                n = len(pos_players)
                if n < 3:
                    for p in pos_players:
                        p["eff_pct"] = 50
                        p["rank_pct"] = 50
                        p["mismatch"] = 0
                    continue

                # Efficiency percentile
                eff_sorted = sorted(pos_players, key=lambda x: x["eff_raw"])
                for i, p in enumerate(eff_sorted):
                    p["eff_pct"] = round((i / (n - 1)) * 100)

                # Dynasty rank percentile (higher dynasty value = higher rank percentile)
                rank_sorted = sorted(pos_players, key=lambda x: x["dynasty_value"])
                for i, p in enumerate(rank_sorted):
                    p["rank_pct"] = round((i / (n - 1)) * 100)

                # Mismatch = efficiency_pct - rank_pct
                # Positive = buy low (efficient but low ranked)
                # Negative = sell high (ranked high but inefficient)
                for p in pos_players:
                    mismatch = p["eff_pct"] - p["rank_pct"]
                    # Age amplifier: young buy lows get bonus, old sell highs get penalty
                    age = p["age"] or 27
                    if mismatch > 0:
                        # Buy low: younger = stronger signal
                        age_mult = 1.0 + max(0, (27 - age)) * 0.05
                    else:
                        # Sell high: older = stronger signal
                        age_mult = 1.0 + max(0, (age - 25)) * 0.05
                    p["mismatch"] = round(mismatch * age_mult, 1)

            # Flatten all players
            all_players = []
            for pos_players in by_pos.values():
                all_players.extend(pos_players)

            # Split into buy low (positive mismatch) and sell high (negative mismatch)
            # Minimum threshold of 10 points mismatch to qualify
            buy_candidates = sorted(
                [p for p in all_players if p["mismatch"] >= 10],
                key=lambda x: x["mismatch"],
                reverse=True,
            )[:limit]

            sell_candidates = sorted(
                [p for p in all_players if p["mismatch"] <= -10],
                key=lambda x: x["mismatch"],
            )[:limit]

            # Clean up internal fields and add presentation data
            def _format_player(p, idx, is_buy):
                grade = _efficiency_grade(p["eff_pct"])
                annotations = _EFFICIENCY_ANNOTATIONS_BUY if is_buy else _EFFICIENCY_ANNOTATIONS_SELL
                return {
                    "player_id": p["player_id"],
                    "name": p["name"],
                    "position": p["position"],
                    "team": p["team"],
                    "age": p["age"],
                    "headshot_url": p["headshot_url"],
                    "ppg": p["ppg"],
                    "games": p["games"],
                    "dynasty_value": p["dynasty_value"],
                    "dynasty_rank_pct": p["rank_pct"],
                    "efficiency_pct": p["eff_pct"],
                    "efficiency_grade": grade,
                    "mismatch_score": abs(p["mismatch"]),
                    "eff_stats": p["eff_stats"],
                    "rank": idx + 1,
                    "annotation": annotations[idx % len(annotations)],
                }

            buy_low = [_format_player(p, i, True) for i, p in enumerate(buy_candidates)]
            sell_high = [_format_player(p, i, False) for i, p in enumerate(sell_candidates)]

            return {
                "season": season,
                "available_seasons": available_seasons,
                "buy_low": buy_low,
                "sell_high": sell_high,
            }

    return _cached(f"buy_sell:{season}:{position}:{limit}", _query)


# ---------------------------------------------------------------------------
# Stat Explorer -- configurable scatter plot data
# ---------------------------------------------------------------------------

# Core stats computed from player_week_stats aggregates (per-game where noted)
_EXPLORER_CORE = {
    "ppg", "targets_g", "receptions_g", "rec_yards_g", "rush_yards_g",
    "carries_g", "air_yards_g", "tds", "age", "snap_pct", "adot",
    "catch_rate", "racr", "games",
}
# Rate stats from player_week_metrics
_EXPLORER_RATE = {"target_share", "air_yards_share", "wopr"}

EXPLORER_METRICS = sorted(_EXPLORER_CORE | _EXPLORER_RATE)


def fetch_stat_explorer(season=None, position=None, x_stat="targets_g", y_stat="ppg"):
    """Return player data for scatter plot with two user-chosen stats."""
    # Validate stat names before cache key
    if x_stat not in (_EXPLORER_CORE | _EXPLORER_RATE):
        x_stat = "targets_g"
    if y_stat not in (_EXPLORER_CORE | _EXPLORER_RATE):
        y_stat = "ppg"

    def _query():
        nonlocal season
        with get_db() as conn:
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]

            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            pos_filter = ""
            params = [season]
            if position and position.upper() in FANTASY_POSITIONS:
                pos_filter = "AND p.position = ?"
                params.append(position.upper())

            rows = conn.execute(f"""
                SELECT
                    p.player_id, p.full_name, p.position, p.team, p.age,
                    p.headshot_url,
                    COUNT(DISTINCT s.week) as games,
                    SUM(s.fantasy_points_ppr) as total_ppr,
                    SUM(s.targets) as total_targets,
                    SUM(s.receptions) as total_receptions,
                    SUM(s.receiving_yards) as total_rec_yards,
                    SUM(s.rushing_yards) as total_rush_yards,
                    SUM(s.carries) as total_carries,
                    SUM(s.receiving_air_yards) as total_air_yards,
                    SUM(s.touchdowns) as total_tds,
                    AVG(s.offense_pct) as avg_snap_pct
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB','RB','WR','TE')
                  {pos_filter}
                GROUP BY p.player_id
                HAVING COUNT(DISTINCT s.week) >= 4
            """, params).fetchall()

            if not rows:
                return {
                    "season": season,
                    "available_seasons": available_seasons,
                    "x_stat": x_stat,
                    "y_stat": y_stat,
                    "players": [],
                    "metrics": EXPLORER_METRICS,
                }

            players = []
            for r in rows:
                games = r[6] or 1
                targets = r[8] or 0
                receptions = r[9] or 0
                air_yards = r[13] or 0
                rec_yards = r[10] or 0

                p = {
                    "player_id": r[0],
                    "name": r[1] or "Unknown",
                    "position": r[2] or "WR",
                    "team": r[3] or "FA",
                    "age": r[4],
                    "headshot_url": r[5] or "",
                    # Core computed stats
                    "games": games,
                    "ppg": round((r[7] or 0) / games, 1),
                    "targets_g": round(targets / games, 1),
                    "receptions_g": round(receptions / games, 1),
                    "rec_yards_g": round(rec_yards / games, 1),
                    "rush_yards_g": round((r[11] or 0) / games, 1),
                    "carries_g": round((r[12] or 0) / games, 1),
                    "air_yards_g": round(air_yards / games, 1),
                    "tds": r[14] or 0,
                    "snap_pct": round(r[15] or 0, 1),
                    "adot": round(air_yards / targets, 1) if targets > 0 else 0,
                    "catch_rate": round(receptions / targets * 100, 1) if targets > 0 else 0,
                    "racr": round(rec_yards / air_yards, 2) if air_yards > 0 else 0,
                }
                players.append(p)

            # Enrich with rate metrics if needed
            need_rate = {x_stat, y_stat} & _EXPLORER_RATE
            if need_rate:
                pid_list = [p["player_id"] for p in players]
                placeholders = ",".join("?" * len(pid_list))
                rate_keys = list(need_rate)
                stat_ph = ",".join("?" * len(rate_keys))

                rate_rows = conn.execute(f"""
                    SELECT m.player_id, m.stat_key, AVG(m.stat_value) as avg_val
                    FROM player_week_metrics m
                    WHERE m.player_id IN ({placeholders})
                      AND m.stat_key IN ({stat_ph})
                      AND m.season = ?
                    GROUP BY m.player_id, m.stat_key
                """, pid_list + rate_keys + [season]).fetchall()

                rate_lookup = {}
                for rr in rate_rows:
                    if rr[0] not in rate_lookup:
                        rate_lookup[rr[0]] = {}
                    rate_lookup[rr[0]][rr[1]] = round(rr[2], 3) if rr[2] is not None else None

                for p in players:
                    rm = rate_lookup.get(p["player_id"], {})
                    for rk in rate_keys:
                        p[rk] = rm.get(rk)

            # Extract x/y values, filter out nulls
            result = []
            for p in players:
                xv = p.get(x_stat)
                yv = p.get(y_stat)
                if xv is None or yv is None:
                    continue
                result.append({
                    "player_id": p["player_id"],
                    "name": p["name"],
                    "position": p["position"],
                    "team": p["team"],
                    "headshot_url": p["headshot_url"],
                    "x": xv,
                    "y": yv,
                })

            return {
                "season": season,
                "available_seasons": available_seasons,
                "x_stat": x_stat,
                "y_stat": y_stat,
                "players": result,
                "metrics": EXPLORER_METRICS,
            }

    return _cached(f"stat_explorer:{season}:{position}:{x_stat}:{y_stat}", _query, ttl=_CACHE_TTL_STABLE)


# ---------------------------------------------------------------------------
# Aging Curves -- PPG by age per position (ACTIVE version)
# ---------------------------------------------------------------------------

def fetch_aging_curves(season=None, position=None):
    """Return aging curve data: average PPG by age for each position,
    plus individual player data points for the selected season."""
    def _query():
        nonlocal season
        with get_db() as conn:
            # Determine available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            positions = [position] if position and position in FANTASY_POSITIONS else list(FANTASY_POSITIONS)
            latest_season = available_seasons[0] if available_seasons else _current_nfl_season()
            result = {}

            for pos in positions:
                # Aggregate curve: average PPG by age across ALL seasons
                # Age at time of season = current_age - (latest_season - that_season)
                curve_query = """
                    SELECT player_age, ROUND(AVG(ppg), 1) as avg_ppg, COUNT(*) as sample_size
                    FROM (
                        SELECT
                            p.player_id,
                            s.season,
                            p.age - (? - s.season) as player_age,
                            CAST(SUM(s.fantasy_points_ppr) AS REAL) / COUNT(DISTINCT s.week) as ppg
                        FROM players p
                        JOIN player_week_stats s ON s.player_id = p.player_id
                        WHERE p.position = ?
                          AND p.fantasy_relevant = 1
                          AND p.age IS NOT NULL
                          AND s.season_type = 'regular'
                        GROUP BY p.player_id, s.season
                        HAVING COUNT(DISTINCT s.week) >= 6
                    ) sub
                    WHERE player_age BETWEEN 20 AND 40
                    GROUP BY player_age
                    HAVING sample_size >= 3
                    ORDER BY player_age
                """
                curve_rows = conn.execute(curve_query, [latest_season, pos]).fetchall()

                curve_points = []
                for cr in curve_rows:
                    curve_points.append({
                        "age": cr[0],
                        "ppg": cr[1],
                        "sample_size": cr[2],
                    })

                # Individual players for the selected season
                players_query = """
                    SELECT
                        p.player_id, p.full_name, p.team, p.age, p.headshot_url,
                        COUNT(DISTINCT s.week) as games,
                        CAST(SUM(s.fantasy_points_ppr) AS REAL) / COUNT(DISTINCT s.week) as ppg
                    FROM players p
                    JOIN player_week_stats s ON s.player_id = p.player_id AND s.season = ?
                    WHERE p.position = ?
                      AND p.fantasy_relevant = 1
                      AND p.age IS NOT NULL
                      AND s.season_type = 'regular'
                    GROUP BY p.player_id
                    HAVING games >= 6
                    ORDER BY ppg DESC
                    LIMIT 500
                """
                player_rows = conn.execute(players_query, [season, pos]).fetchall()

                players = []
                for pr in player_rows:
                    players.append({
                        "player_id": pr[0],
                        "name": pr[1] or "Unknown",
                        "team": pr[2] or "",
                        "age": pr[3],
                        "headshot_url": pr[4] or "",
                        "games": pr[5],
                        "ppg": round(pr[6], 1) if pr[6] else 0,
                    })

                # Peak age from curve
                peak_age = None
                peak_ppg = 0
                for cp in curve_points:
                    if cp["ppg"] > peak_ppg:
                        peak_ppg = cp["ppg"]
                        peak_age = cp["age"]

                result[pos] = {
                    "curve": curve_points,
                    "players": players,
                    "peak_age": peak_age,
                    "peak_ppg": peak_ppg,
                }

            return {
                "season": season,
                "available_seasons": available_seasons,
                "positions": result,
            }

    return _cached(f"aging_curves:{season}:{position}", _query, ttl=_CACHE_TTL_STABLE)


def fetch_weekly_heatmap(season=None, position=None, limit=40):
    """Return weekly fantasy scores for top players in a grid format.

    Returns player rows with per-week PPG values and positional percentile
    thresholds for color coding.
    """
    def _query():
        nonlocal season
        with get_db() as conn:
            # Determine available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            positions = [position] if position and position in FANTASY_POSITIONS else list(FANTASY_POSITIONS)

            # Get available weeks for this season
            week_rows = conn.execute(
                "SELECT DISTINCT week FROM player_week_stats WHERE season = ? AND season_type = 'regular' ORDER BY week",
                [season]
            ).fetchall()
            weeks = [r[0] for r in week_rows] if week_rows else []

            # Collect all weekly scores for percentile thresholds (per position)
            pos_thresholds = {}
            for pos in positions:
                scores_row = conn.execute("""
                    SELECT s.fantasy_points_ppr
                    FROM player_week_stats s
                    JOIN players p ON p.player_id = s.player_id
                    WHERE s.season = ? AND p.position = ?
                      AND s.season_type = 'regular'
                      AND s.fantasy_points_ppr IS NOT NULL
                      AND p.fantasy_relevant = 1
                    ORDER BY s.fantasy_points_ppr
                """, [season, pos]).fetchall()
                vals = [r[0] for r in scores_row if r[0] is not None]
                if vals:
                    n = len(vals)
                    pos_thresholds[pos] = {
                        "p20": vals[int(n * 0.2)] if n > 5 else 5,
                        "p40": vals[int(n * 0.4)] if n > 5 else 10,
                        "p60": vals[int(n * 0.6)] if n > 5 else 15,
                        "p80": vals[int(n * 0.8)] if n > 5 else 20,
                    }
                else:
                    pos_thresholds[pos] = {"p20": 5, "p40": 10, "p60": 15, "p80": 20}

            # Get top players by total fantasy points, with weekly breakdown
            pos_filter = ""
            pos_params = [season]
            if position and position in FANTASY_POSITIONS:
                pos_filter = "AND p.position = ?"
                pos_params.append(position)

            top_players = conn.execute(f"""
                SELECT
                    p.player_id, p.full_name, p.position, p.team, p.headshot_url,
                    COUNT(DISTINCT s.week) as games,
                    SUM(s.fantasy_points_ppr) as total_pts,
                    CAST(SUM(s.fantasy_points_ppr) AS REAL) / COUNT(DISTINCT s.week) as ppg
                FROM players p
                JOIN player_week_stats s ON s.player_id = p.player_id AND s.season = ?
                WHERE p.fantasy_relevant = 1
                  AND s.season_type = 'regular'
                  AND s.fantasy_points_ppr IS NOT NULL
                  {pos_filter}
                GROUP BY p.player_id
                HAVING games >= 4
                ORDER BY total_pts DESC
                LIMIT ?
            """, pos_params + [min(limit, 50)]).fetchall()

            # Get weekly scores for these players
            player_ids = [r[0] for r in top_players]
            weekly_data = {}
            if player_ids:
                placeholders = ",".join("?" * len(player_ids))
                week_rows_data = conn.execute(f"""
                    SELECT player_id, week, fantasy_points_ppr
                    FROM player_week_stats
                    WHERE season = ? AND season_type = 'regular' AND player_id IN ({placeholders})
                    ORDER BY player_id, week
                """, [season] + player_ids).fetchall()
                for wr in week_rows_data:
                    pid = wr[0]
                    if pid not in weekly_data:
                        weekly_data[pid] = {}
                    weekly_data[pid][wr[1]] = round(wr[2], 1) if wr[2] is not None else None

            # Build output
            players = []
            for r in top_players:
                pid = r[0]
                pos = r[2] or "WR"
                week_scores = {}
                for w in weeks:
                    score = weekly_data.get(pid, {}).get(w)
                    week_scores[str(w)] = score
                players.append({
                    "player_id": pid,
                    "name": r[1] or "Unknown",
                    "position": pos,
                    "team": r[3] or "",
                    "headshot_url": r[4] or "",
                    "games": r[5],
                    "total_pts": round(r[6], 1) if r[6] else 0,
                    "ppg": round(r[7], 1) if r[7] else 0,
                    "weeks": week_scores,
                })

            return {
                "season": season,
                "available_seasons": available_seasons,
                "weeks": weeks,
                "thresholds": pos_thresholds,
                "players": players,
            }

    return _cached(f"weekly_heatmap:{season}:{position}:{limit}", _query)


def fetch_target_distribution(season=None, team=None, week=None):
    """Return target and carry distribution by team.

    For each team, returns players sorted by targets (or carries for RB-heavy),
    with their share of team totals.
    """
    def _query():
        nonlocal season
        with get_db() as conn:
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            teams_filter = ""
            week_filter = ""
            params = [season]
            _week = _safe_int(week)
            if _week > 0:
                week_filter = "AND s.week = ?"
                params.append(_week)
            if team and team.upper() in ABBREV_TO_TEAM:
                teams_filter = "AND p.team = ?"
                params.append(team.upper())

            # Get all players with targets or carries
            rows = conn.execute(f"""
                SELECT
                    p.player_id, p.full_name, p.position, p.team, p.headshot_url,
                    COUNT(DISTINCT s.week) as games,
                    COALESCE(SUM(s.targets), 0) as targets,
                    COALESCE(SUM(s.carries), 0) as carries,
                    COALESCE(SUM(s.receptions), 0) as receptions,
                    COALESCE(SUM(s.receiving_yards), 0) as rec_yards,
                    COALESCE(SUM(s.rushing_yards), 0) as rush_yards,
                    COALESCE(SUM(s.receiving_tds), 0) as rec_tds,
                    COALESCE(SUM(s.rushing_tds), 0) as rush_tds,
                    COALESCE(SUM(s.fantasy_points_ppr), 0) as ppr_pts
                FROM players p
                JOIN player_week_stats s ON s.player_id = p.player_id AND s.season = ?
                WHERE p.position IN ('QB', 'RB', 'WR', 'TE')
                  AND p.team IS NOT NULL AND p.team != ''
                  AND s.season_type = 'regular'
                  {week_filter}
                  {teams_filter}
                GROUP BY p.player_id
                HAVING (targets > 0 OR carries > 0) AND games >= 3
                ORDER BY p.team, targets DESC
                LIMIT 500
            """, params).fetchall()

            # Group by team
            team_data = {}
            for r in rows:
                t = r[3]
                if t not in team_data:
                    team_data[t] = {"team": t, "team_name": ABBREV_TO_TEAM.get(t, t), "total_targets": 0, "total_carries": 0, "players": []}
                targets = r[6]
                carries = r[7]
                team_data[t]["total_targets"] += targets
                team_data[t]["total_carries"] += carries
                team_data[t]["players"].append({
                    "player_id": r[0],
                    "name": r[1] or "Unknown",
                    "position": r[2] or "",
                    "team": t,
                    "headshot_url": r[4] or "",
                    "games": r[5],
                    "targets": targets,
                    "carries": carries,
                    "receptions": r[8],
                    "rec_yards": r[9],
                    "rush_yards": r[10],
                    "rec_tds": r[11],
                    "rush_tds": r[12],
                    "ppr_pts": round(r[13], 1),
                })

            # Compute shares and sort teams by total targets
            teams_out = []
            for t in sorted(team_data.keys()):
                td = team_data[t]
                tt = td["total_targets"] or 1
                tc = td["total_carries"] or 1
                for p in td["players"]:
                    p["target_share"] = round(p["targets"] / tt * 100, 1)
                    p["carry_share"] = round(p["carries"] / tc * 100, 1)
                # Sort players: WR/TE by targets, RB by carries, QB last
                td["players"].sort(key=lambda x: x["targets"] + x["carries"], reverse=True)
                # Keep top 8 per team to avoid clutter
                td["players"] = td["players"][:8]
                teams_out.append(td)

            # Sort teams alphabetically
            teams_out.sort(key=lambda x: x["team"])

            return {
                "season": season,
                "available_seasons": available_seasons,
                "teams": teams_out,
            }

    return _cached(f"target_dist:{season}:{team}:{week}", _query)


# ---------------------------------------------------------------------------
# Matchup Heatmap -- Fantasy Points Allowed by Defense per Position
# ---------------------------------------------------------------------------

def fetch_matchup_heatmap(season=None, position=None):
    """Return avg fantasy points allowed per game by each defense to each position.

    Computes from opponent_team in player_week_stats: group all player scores
    by opponent_team and position to find how many PPR points each defense allows.
    """
    def _query():
        nonlocal season
        with get_db() as conn:
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            pos_filter = ""
            params = [season]
            if position and position.upper() in FANTASY_POSITIONS:
                pos_filter = "AND p.position = ?"
                params.append(position.upper())

            # Sum fantasy points scored AGAINST each opponent_team, grouped by position
            rows = conn.execute(f"""
                SELECT
                    s.opponent_team as defense,
                    p.position,
                    COALESCE(SUM(s.fantasy_points_ppr), 0) as total_ppr
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB', 'RB', 'WR', 'TE')
                  AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
                  {pos_filter}
                GROUP BY s.opponent_team, p.position
                ORDER BY s.opponent_team, p.position
            """, params).fetchall()

            if not rows:
                return {"season": season, "available_seasons": available_seasons, "teams": [], "averages": {}}

            # Count distinct weeks per defense for games played
            game_rows = conn.execute("""
                SELECT opponent_team, COUNT(DISTINCT week) as games
                FROM player_week_stats
                WHERE season = ? AND season_type = 'regular'
                  AND opponent_team IS NOT NULL AND opponent_team != ''
                GROUP BY opponent_team
            """, [season]).fetchall()
            defense_games = {r[0]: r[1] for r in game_rows}

            # Build team x position grid
            team_data = {}
            all_pos_totals = {"QB": [], "RB": [], "WR": [], "TE": []}

            for r in rows:
                defense = r[0]
                pos = r[1]
                total_ppr = r[2]
                games = defense_games.get(defense, 1)
                avg_ppg = round(total_ppr / games, 1) if games > 0 else 0

                if defense not in team_data:
                    team_data[defense] = {}
                team_data[defense][pos] = {
                    "total": round(total_ppr, 1),
                    "avg_ppg": avg_ppg,
                    "games": games,
                }
                all_pos_totals[pos].append({"defense": defense, "avg": avg_ppg})

            # Rank each defense per position (1 = allows most = easiest matchup)
            pos_ranks = {}
            pos_averages = {}
            for pos in ["QB", "RB", "WR", "TE"]:
                sorted_teams = sorted(all_pos_totals[pos], key=lambda x: x["avg"], reverse=True)
                pos_ranks[pos] = {t["defense"]: i + 1 for i, t in enumerate(sorted_teams)}
                if sorted_teams:
                    pos_averages[pos] = round(
                        sum(t["avg"] for t in sorted_teams) / len(sorted_teams), 1
                    )
                else:
                    pos_averages[pos] = 0

            # Assemble output
            teams_out = []
            for defense in sorted(team_data.keys()):
                entry = {
                    "team": defense,
                    "team_name": ABBREV_TO_TEAM.get(defense, defense),
                    "games": defense_games.get(defense, 0),
                    "positions": {},
                    "total_avg": 0,
                }
                total = 0
                for pos in ["QB", "RB", "WR", "TE"]:
                    if pos in team_data[defense]:
                        d = team_data[defense][pos]
                        d["rank"] = pos_ranks.get(pos, {}).get(defense, 0)
                        entry["positions"][pos] = d
                        total += d["avg_ppg"]
                    else:
                        entry["positions"][pos] = {"total": 0, "avg_ppg": 0, "games": 0, "rank": 0}
                entry["total_avg"] = round(total, 1)
                teams_out.append(entry)

            # Top scorers against each defense (detail view) -- only when position specified
            detail = {}
            if position and position.upper() in FANTASY_POSITIONS:
                pos_up = position.upper()
                detail_rows = conn.execute("""
                    SELECT
                        p.player_id, p.full_name, p.position, p.team, p.headshot_url,
                        s.opponent_team as defense,
                        COUNT(DISTINCT s.week) as games_vs,
                        COALESCE(SUM(s.fantasy_points_ppr), 0) as total_ppr,
                        ROUND(COALESCE(SUM(s.fantasy_points_ppr), 0) * 1.0 / MAX(1, COUNT(DISTINCT s.week)), 1) as ppg_vs
                    FROM player_week_stats s
                    JOIN players p ON p.player_id = s.player_id
                    WHERE s.season = ?
                      AND s.season_type = 'regular'
                      AND p.position = ?
                      AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
                      AND s.fantasy_points_ppr > 0
                    GROUP BY s.opponent_team, p.player_id
                    HAVING games_vs >= 1
                    ORDER BY s.opponent_team, total_ppr DESC
                """, [season, pos_up]).fetchall()

                for dr in detail_rows:
                    defense = dr[5]
                    if defense not in detail:
                        detail[defense] = []
                    if len(detail[defense]) < 5:
                        detail[defense].append({
                            "player_id": dr[0],
                            "name": dr[1] or "Unknown",
                            "position": dr[2],
                            "team": dr[3] or "",
                            "headshot_url": dr[4] or "",
                            "games_vs": dr[6],
                            "total_ppr": round(dr[7], 1),
                            "ppg_vs": dr[8],
                        })

            return {
                "season": season,
                "available_seasons": available_seasons,
                "teams": teams_out,
                "averages": pos_averages,
                "detail": detail,
            }

    return _cached(f"matchup_heatmap:{season}:{position}", _query)


# ---------------------------------------------------------------------------
# Snap Count & Usage Trends -- weekly snap% with risers/fallers
# ---------------------------------------------------------------------------

_USAGE_RISER_ANNOTATIONS = [
    "usage spike",
    "trending up",
    "earning more snaps",
    "role expanding",
    "snap count climbing",
    "getting the reps",
    "opportunity rising",
    "workload growing",
]

_USAGE_FALLER_ANNOTATIONS = [
    "losing snaps",
    "red flag",
    "role shrinking",
    "trending down",
    "being phased out",
    "snap count dropping",
    "opportunity fading",
    "workload declining",
]


def fetch_usage_trends(season=None, position=None, window=5, limit=30, week=None):
    """Return players with weekly snap% trends, identifying risers and fallers."""
    window = max(3, min(window, 18))

    def _query():
        nonlocal season
        with get_db() as conn:
            # Determine season + available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            pos_filter = ""
            week_filter = ""
            params = [season]
            _week = _safe_int(week)
            if _week > 0:
                week_filter = "AND s.week = ?"
                params.append(_week)
            if position and position.upper() in FANTASY_POSITIONS:
                pos_filter = "AND p.position = ?"
                params.append(position.upper())

            # Get weekly snap% for all relevant players
            query = f"""
                SELECT
                    p.player_id, p.full_name, p.position, p.team, p.age,
                    p.headshot_url,
                    s.week,
                    s.offense_pct
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB','RB','WR','TE')
                  AND p.fantasy_relevant = 1
                  AND s.offense_pct IS NOT NULL
                  AND s.offense_pct > 0
                  {week_filter}
                  {pos_filter}
                ORDER BY p.player_id, s.week
            """
            rows = conn.execute(query, params).fetchall()

            if not rows:
                return {
                    "season": season,
                    "available_seasons": available_seasons,
                    "risers": [],
                    "fallers": [],
                    "window": window,
                }

            # Group by player
            player_weeks = defaultdict(list)
            player_info = {}

            for r in rows:
                pid = r[0]
                if pid not in player_info:
                    player_info[pid] = {
                        "player_id": pid,
                        "name": r[1] or "Unknown",
                        "position": r[2] or "WR",
                        "team": r[3] or "FA",
                        "age": r[4],
                        "headshot_url": r[5] or "",
                    }
                player_weeks[pid].append({
                    "week": r[6],
                    "snap_pct": round(r[7], 1) if r[7] else 0,
                })

            # Compute trends for each player
            players_with_trends = []

            for pid, weeks in player_weeks.items():
                # Sort by week
                weeks.sort(key=lambda w: w["week"])

                # Need at least 3 games total
                if len(weeks) < 3:
                    continue

                # Get the latest N weeks (based on window)
                recent = weeks[-window:] if len(weeks) >= window else weeks

                if len(recent) < 2:
                    continue

                # Build full week array (all weeks, not just window)
                all_weeks_data = []
                for w in weeks:
                    all_weeks_data.append({"week": w["week"], "snap_pct": w["snap_pct"]})

                # Compute trend: compare first half avg vs second half avg of window
                mid = len(recent) // 2
                first_half = recent[:mid] if mid > 0 else recent[:1]
                second_half = recent[mid:] if mid > 0 else recent[1:]

                first_avg = sum(w["snap_pct"] for w in first_half) / (len(first_half) or 1)
                second_avg = sum(w["snap_pct"] for w in second_half) / (len(second_half) or 1)
                delta = round(second_avg - first_avg, 1)

                current_snap = recent[-1]["snap_pct"]
                season_avg = round(sum(w["snap_pct"] for w in weeks) / len(weeks), 1)

                info = player_info[pid]
                info["weeks"] = all_weeks_data
                info["current_snap_pct"] = current_snap
                info["season_avg_snap_pct"] = season_avg
                info["delta"] = delta
                info["games"] = len(weeks)
                info["trend"] = "up" if delta > 0 else ("down" if delta < 0 else "flat")

                players_with_trends.append(info)

            # Split into risers (positive delta) and fallers (negative delta)
            risers = sorted(
                [p for p in players_with_trends if p["delta"] > 2],
                key=lambda x: x["delta"],
                reverse=True,
            )[:limit]

            fallers = sorted(
                [p for p in players_with_trends if p["delta"] < -2],
                key=lambda x: x["delta"],
            )[:limit]

            # Add annotations
            for i, p in enumerate(risers):
                p["annotation"] = _USAGE_RISER_ANNOTATIONS[i % len(_USAGE_RISER_ANNOTATIONS)]

            for i, p in enumerate(fallers):
                p["annotation"] = _USAGE_FALLER_ANNOTATIONS[i % len(_USAGE_FALLER_ANNOTATIONS)]

            return {
                "season": season,
                "available_seasons": available_seasons,
                "risers": risers,
                "fallers": fallers,
                "window": window,
            }

    return _cached(f"usage_trends:{season}:{position}:{window}:{limit}:{week}", _query)


# -- Year-over-Year Comparison -----------------------------------------------

_YOY_RISER_ANNOTATIONS = [
    "breakout year", "big leap", "leveled up", "new tier",
    "took a step", "major glow-up", "ascending", "on the rise",
]
_YOY_FALLER_ANNOTATIONS = [
    "falling off", "regression", "step back", "lost a step",
    "trending down", "declining", "red flag", "worrying drop",
]


def fetch_year_over_year(season=None, position=None, metric="ppg", limit=25):
    """Compare per-game stats between two adjacent seasons for each player."""
    def _query():
        nonlocal season
        with get_db() as conn:
            # Determine available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]

            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            prev_season = season - 1
            if prev_season not in available_seasons:
                return {
                    "season": season,
                    "prev_season": prev_season,
                    "available_seasons": available_seasons,
                    "risers": [],
                    "fallers": [],
                    "metric": metric,
                    "error": f"No data for {prev_season}",
                }

            pos_filter = ""
            params_curr = [season]
            params_prev = [prev_season]
            if position and position.upper() in FANTASY_POSITIONS:
                pos_filter = "AND p.position = ?"
                params_curr.append(position.upper())
                params_prev.append(position.upper())

            # Query per-game stats for both seasons
            query_tmpl = f"""
                SELECT
                    p.player_id, p.full_name, p.position, p.team, p.age,
                    p.headshot_url,
                    COUNT(DISTINCT s.week) as games,
                    SUM(s.fantasy_points_ppr) as total_ppr,
                    SUM(s.targets) as total_targets,
                    SUM(s.receptions) as total_receptions,
                    SUM(s.receiving_yards) as total_rec_yards,
                    SUM(s.rushing_yards) as total_rush_yards,
                    SUM(s.touchdowns) as total_tds,
                    SUM(s.carries) as total_carries,
                    AVG(s.offense_pct) as avg_snap_pct
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  AND p.position IN ('QB','RB','WR','TE')
                  {pos_filter}
                GROUP BY p.player_id
                HAVING COUNT(DISTINCT s.week) >= 4
            """

            curr_rows = conn.execute(query_tmpl, params_curr).fetchall()
            prev_rows = conn.execute(query_tmpl, params_prev).fetchall()

            if not curr_rows or not prev_rows:
                return {
                    "season": season,
                    "prev_season": prev_season,
                    "available_seasons": available_seasons,
                    "risers": [],
                    "fallers": [],
                    "metric": metric,
                }

            # Build lookup for previous season
            prev_lookup = {}
            for r in prev_rows:
                pid = r[0]
                games = r[6] or 1
                prev_lookup[pid] = {
                    "games": games,
                    "ppg": round((r[7] or 0) / games, 1),
                    "tgt_g": round((r[8] or 0) / games, 1),
                    "rec_g": round((r[9] or 0) / games, 1),
                    "rec_yd_g": round((r[10] or 0) / games, 1),
                    "rush_yd_g": round((r[11] or 0) / games, 1),
                    "td_total": r[12] or 0,
                    "carries_g": round((r[13] or 0) / games, 1),
                    "snap_pct": round(r[14] or 0, 1),
                }

            # Build current season data and compute deltas
            players = []
            for r in curr_rows:
                pid = r[0]
                if pid not in prev_lookup:
                    continue

                games = r[6] or 1
                curr = {
                    "ppg": round((r[7] or 0) / games, 1),
                    "tgt_g": round((r[8] or 0) / games, 1),
                    "rec_g": round((r[9] or 0) / games, 1),
                    "rec_yd_g": round((r[10] or 0) / games, 1),
                    "rush_yd_g": round((r[11] or 0) / games, 1),
                    "td_total": r[12] or 0,
                    "carries_g": round((r[13] or 0) / games, 1),
                    "snap_pct": round(r[14] or 0, 1),
                }

                prev = prev_lookup[pid]

                # Compute deltas
                deltas = {}
                for k in curr:
                    deltas[k] = round(curr[k] - prev[k], 1)

                players.append({
                    "player_id": pid,
                    "name": r[1] or "Unknown",
                    "position": r[2] or "WR",
                    "team": r[3] or "FA",
                    "age": r[4],
                    "headshot_url": r[5] or "",
                    "curr_games": games,
                    "prev_games": prev["games"],
                    "curr": curr,
                    "prev": prev,
                    "deltas": deltas,
                })

            # Sort by chosen metric delta
            metric_key = metric if metric in ("ppg", "tgt_g", "rec_yd_g", "rush_yd_g", "td_total", "snap_pct") else "ppg"

            risers = sorted(
                [p for p in players if p["deltas"][metric_key] > 0.5],
                key=lambda x: x["deltas"][metric_key],
                reverse=True,
            )[:limit]

            fallers = sorted(
                [p for p in players if p["deltas"][metric_key] < -0.5],
                key=lambda x: x["deltas"][metric_key],
            )[:limit]

            # Add annotations
            for i, p in enumerate(risers):
                p["annotation"] = _YOY_RISER_ANNOTATIONS[i % len(_YOY_RISER_ANNOTATIONS)]

            for i, p in enumerate(fallers):
                p["annotation"] = _YOY_FALLER_ANNOTATIONS[i % len(_YOY_FALLER_ANNOTATIONS)]

            return {
                "season": season,
                "prev_season": prev_season,
                "available_seasons": available_seasons,
                "risers": risers,
                "fallers": fallers,
                "metric": metric_key,
            }

    return _cached(f"yoy:{season}:{position}:{metric}:{limit}", _query)


# ---------------------------------------------------------------------------
# Air Yards Dashboard
# ---------------------------------------------------------------------------

_AIR_BUY_LOW_ANNOTATIONS = ["due for more", "regression coming", "breakout loading", "undervalued", "TD drought ending"]
_AIR_SELL_HIGH_ANNOTATIONS = ["efficiency mirage", "TD luck", "volume mirage", "overperforming air yards", "regression risk"]


def fetch_air_yards(season=None, position=None, limit=25):
    """Air yards leaderboard with regression indicators (air yards rank vs PPG rank delta)."""
    def _query():
        nonlocal season
        with get_db() as conn:
            # Determine available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]

            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            # Only pass catchers (no QB)
            valid_pos = ("WR", "RB", "TE")
            pos_filter = ""
            params = [season]
            if position and position.upper() in valid_pos:
                pos_filter = "AND p.position = ?"
                params.append(position.upper())
            else:
                pos_filter = "AND p.position IN ('WR','RB','TE')"

            # Core stats query
            rows = conn.execute(f"""
                SELECT
                    p.player_id, p.full_name, p.position, p.team, p.age,
                    p.headshot_url,
                    COUNT(DISTINCT s.week) as games,
                    SUM(s.fantasy_points_ppr) as total_ppr,
                    SUM(s.targets) as total_targets,
                    SUM(s.receptions) as total_receptions,
                    SUM(s.receiving_yards) as total_rec_yards,
                    SUM(s.receiving_air_yards) as total_air_yards,
                    SUM(s.receiving_yards_after_catch) as total_yac
                FROM player_week_stats s
                JOIN players p ON p.player_id = s.player_id
                WHERE s.season = ?
                  AND s.season_type = 'regular'
                  {pos_filter}
                GROUP BY p.player_id
                HAVING COUNT(DISTINCT s.week) >= 4 AND SUM(s.targets) >= 10
            """, params).fetchall()

            if not rows:
                return {
                    "season": season,
                    "available_seasons": available_seasons,
                    "buy_low": [],
                    "sell_high": [],
                }

            # Build player dicts with core stats
            players = []
            for r in rows:
                games = r[6] or 1
                targets = r[8] or 0
                air_yards = r[11] or 0
                rec_yards = r[10] or 0
                adot = round(air_yards / targets, 1) if targets > 0 else 0
                racr_val = round(rec_yards / air_yards, 2) if air_yards > 0 else 0
                ppg = round((r[7] or 0) / games, 1)

                players.append({
                    "player_id": r[0],
                    "name": r[1] or "Unknown",
                    "position": r[2] or "WR",
                    "team": r[3] or "FA",
                    "age": r[4],
                    "headshot_url": r[5] or "",
                    "games": games,
                    "ppg": ppg,
                    "targets": targets,
                    "targets_g": round(targets / games, 1),
                    "receptions": r[9] or 0,
                    "rec_yards": rec_yards,
                    "air_yards": air_yards,
                    "air_yards_g": round(air_yards / games, 1),
                    "yac": r[12] or 0,
                    "adot": adot,
                    "racr": racr_val,
                })

            # Enrich with rate metrics (air_yards_share, wopr)
            rate_keys = ["air_yards_share", "wopr", "target_share"]
            pid_list = [p["player_id"] for p in players]
            placeholders = ",".join("?" * len(pid_list))
            stat_ph = ",".join("?" * len(rate_keys))

            rate_rows = conn.execute(f"""
                SELECT m.player_id, m.stat_key, AVG(m.stat_value) as avg_val
                FROM player_week_metrics m
                WHERE m.player_id IN ({placeholders})
                  AND m.stat_key IN ({stat_ph})
                  AND m.season = ?
                GROUP BY m.player_id, m.stat_key
            """, pid_list + rate_keys + [season]).fetchall()

            rate_lookup = {}
            for rr in rate_rows:
                if rr[0] not in rate_lookup:
                    rate_lookup[rr[0]] = {}
                rate_lookup[rr[0]][rr[1]] = round(rr[2], 3) if rr[2] is not None else None

            for p in players:
                rm = rate_lookup.get(p["player_id"], {})
                p["air_yards_share"] = rm.get("air_yards_share")
                p["wopr"] = rm.get("wopr")
                p["target_share"] = rm.get("target_share")

            # Compute regression indicator: rank by air_yards desc vs rank by ppg desc
            # High air yards rank + low PPG rank = buy low (positive regression)
            sorted_by_air = sorted(players, key=lambda x: x["air_yards"], reverse=True)
            sorted_by_ppg = sorted(players, key=lambda x: x["ppg"], reverse=True)

            air_rank = {p["player_id"]: i + 1 for i, p in enumerate(sorted_by_air)}
            ppg_rank = {p["player_id"]: i + 1 for i, p in enumerate(sorted_by_ppg)}

            for p in players:
                pid = p["player_id"]
                p["air_rank"] = air_rank[pid]
                p["ppg_rank"] = ppg_rank[pid]
                # Positive delta = PPG rank worse than air yards rank = buy low
                p["regression_delta"] = ppg_rank[pid] - air_rank[pid]

            # Buy low: high air yards but underperforming (positive regression delta)
            buy_low = sorted([p for p in players if p["regression_delta"] > 3],
                             key=lambda x: x["regression_delta"], reverse=True)[:limit]

            # Sell high: low air yards but overperforming (negative regression delta)
            sell_high = sorted([p for p in players if p["regression_delta"] < -3],
                               key=lambda x: x["regression_delta"])[:limit]

            # Add annotations
            for i, p in enumerate(buy_low):
                p["annotation"] = _AIR_BUY_LOW_ANNOTATIONS[i % len(_AIR_BUY_LOW_ANNOTATIONS)]

            for i, p in enumerate(sell_high):
                p["annotation"] = _AIR_SELL_HIGH_ANNOTATIONS[i % len(_AIR_SELL_HIGH_ANNOTATIONS)]

            return {
                "season": season,
                "available_seasons": available_seasons,
                "buy_low": buy_low,
                "sell_high": sell_high,
            }

    return _cached(f"air_yards:{season}:{position}:{limit}", _query)


# ---------------------------------------------------------------------------
# Red Zone & Goal-Line Dashboard
# ---------------------------------------------------------------------------

_GL_DOMINATOR_ANNOTATIONS = [
    "goal-line king", "TD machine", "vulture alert", "owns the paint",
    "red zone magnet", "short-yardage beast", "the closer", "money zone",
]

_TD_DEPENDENT_ANNOTATIONS = [
    "TD or bust", "boom-or-bust vibes", "needs TDs to eat", "fragile floor",
    "TD reliant", "scoring dependent", "touchdown or nothing", "risky profile",
]


def fetch_redzone_usage(season=None, position=None, limit=30, week=None):
    """Return goal-line usage leaders and TD-dependent players."""
    def _query():
        nonlocal season
        with get_db() as conn:
            # Determine season + available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            pos_filter = ""
            week_filter = ""
            params = [season]
            _week = _safe_int(week)
            if _week > 0:
                week_filter = "AND s.week = ?"
                params.append(_week)
            if position and position.upper() in ("QB", "RB", "WR", "TE"):
                pos_filter = "AND p.position = ?"
                params.append(position.upper())

            # Get season stats: fantasy points + TDs + games
            query = f"""
                SELECT
                    p.player_id, p.full_name, p.position, p.team,
                    p.headshot_url,
                    SUM(s.fantasy_points_ppr) as total_ppr,
                    COUNT(DISTINCT s.week) as games,
                    SUM(s.rushing_tds) as rush_tds,
                    SUM(s.receiving_tds) as rec_tds,
                    SUM(s.passing_tds) as pass_tds
                FROM players p
                JOIN player_week_stats s
                    ON s.player_id = p.player_id AND s.season = ?
                WHERE p.position IN ('QB','RB','WR','TE')
                  AND p.fantasy_relevant = 1
                  AND s.season_type = 'regular'
                  {week_filter}
                  {pos_filter}
                GROUP BY p.player_id
                HAVING games >= 4
                ORDER BY total_ppr DESC
                LIMIT 500
            """
            rows = conn.execute(query, params).fetchall()

            if not rows:
                return {
                    "season": season,
                    "available_seasons": available_seasons,
                    "dominators": [],
                    "td_dependent": [],
                }

            # Check if player_season_pbp table exists
            table_check = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='player_season_pbp'"
            ).fetchone()

            # Build lookup for goal-line stats from PBP table
            gl_lookup = {}
            if table_check:
                pids = [r[0] for r in rows]
                placeholders = ",".join("?" * len(pids))
                gl_rows = conn.execute(f"""
                    SELECT player_id, gl_carries, gl_targets, gl_tds
                    FROM player_season_pbp
                    WHERE player_id IN ({placeholders}) AND season = ?
                """, pids + [season]).fetchall()
                for gr in gl_rows:
                    gl_lookup[gr[0]] = {
                        "gl_carries": gr[1] or 0,
                        "gl_targets": gr[2] or 0,
                        "gl_tds": gr[3] or 0,
                    }

            # Build player objects
            players = []
            for r in rows:
                pid = r[0]
                games = r[6] or 1
                total_ppr = r[5] or 0
                ppg = round(total_ppr / games, 2)
                rush_tds = r[7] or 0
                rec_tds = r[8] or 0
                pass_tds = r[9] or 0
                total_tds = rush_tds + rec_tds + pass_tds

                gl = gl_lookup.get(pid, {"gl_carries": 0, "gl_targets": 0, "gl_tds": 0})
                gl_opps = gl["gl_carries"] + gl["gl_targets"]
                gl_td_rate = round(gl["gl_tds"] / gl_opps * 100, 1) if gl_opps > 0 else 0

                # TD points as % of total fantasy points
                # PPR: rush TD = 6, rec TD = 6, pass TD = 4
                td_pts = rush_tds * 6 + rec_tds * 6 + pass_tds * 4
                td_pct = round(td_pts / total_ppr * 100, 1) if total_ppr > 0 else 0

                players.append({
                    "player_id": pid,
                    "name": r[1] or "Unknown",
                    "position": r[2] or "RB",
                    "team": r[3] or "FA",
                    "headshot_url": r[4] or "",
                    "ppg": ppg,
                    "games": games,
                    "total_tds": total_tds,
                    "rush_tds": rush_tds,
                    "rec_tds": rec_tds,
                    "gl_carries": gl["gl_carries"],
                    "gl_targets": gl["gl_targets"],
                    "gl_tds": gl["gl_tds"],
                    "gl_opportunities": gl_opps,
                    "gl_td_rate": gl_td_rate,
                    "td_pct_of_fantasy": td_pct,
                })

            # Goal-Line Dominators: sorted by GL opportunities, min 3
            dominators = sorted(
                [p for p in players if p["gl_opportunities"] >= 3],
                key=lambda x: x["gl_opportunities"], reverse=True
            )[:limit]

            for i, p in enumerate(dominators):
                p["annotation"] = _GL_DOMINATOR_ANNOTATIONS[i % len(_GL_DOMINATOR_ANNOTATIONS)]

            # TD Dependent: sorted by td_pct_of_fantasy desc, min 2 TDs
            td_dependent = sorted(
                [p for p in players if p["total_tds"] >= 2],
                key=lambda x: x["td_pct_of_fantasy"], reverse=True
            )[:limit]

            for i, p in enumerate(td_dependent):
                p["annotation"] = _TD_DEPENDENT_ANNOTATIONS[i % len(_TD_DEPENDENT_ANNOTATIONS)]

            return {
                "season": season,
                "available_seasons": available_seasons,
                "dominators": dominators,
                "td_dependent": td_dependent,
            }

    return _cached(f"redzone:{season}:{position}:{limit}:{week}", _query)
