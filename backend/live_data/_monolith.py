"""
Razzle data layer — all SQLite queries for the API.
server.py calls these functions; they return dicts ready for JSON.

Shared helpers, constants, and enrichment functions live in core.py.
"""

import math
import re
import sqlite3
import statistics
from pathlib import Path

from ..db import get_conn, get_db, DB_PATH

# Re-export everything from core so existing `from ._monolith import *` works
from .core import (  # noqa: F401
    _cache, _CACHE_TTL, _cached,
    FANTASY_POSITIONS, RATE_METRICS, _STAT_SUM_COLS,
    TEAM_ABBREV, ABBREV_TO_TEAM,
    _safe_div,
    _enrich_with_derived_stats, _enrich_with_epa_per_play,
    _enrich_with_rate_metrics, _enrich_with_breakout,
    _DVS_AGE_CURVES, _age_multiplier, _enrich_with_dynasty_value,
    _enrich_with_pbp_stats, _enrich_with_team_shares,
    _NICKNAME_MAP, _name_variants, _enrich_prospects_with_college,
    _enrich_college_derived,
    _AGE_PEAKS, _AGE_DECAY, _ELITE_PPG, _SCARCITY,
    _age_value, _production_value, _scarcity_value, compute_trade_value,
    _pick_value,
    _GRADE_THRESHOLDS, _roster_grade, _competing_status,
    _TIER_LABELS, _assign_tier,
    _TV_TIER_LABELS, _tv_tier,
    _efficiency_grade,
    _COMP_STATS, _COMP_STAT_LABELS, _build_stat_vector, _cosine_similarity,
)

# Re-export player functions from players.py
from .players import (  # noqa: F401
    db_stats, quick_search_players, fetch_players, fetch_screener,
    get_filter_options, fetch_player_weeks, fetch_player_seasons,
    fetch_player_profile, fetch_players_compare, fetch_team_roster,
    fetch_career_stats, fetch_player_percentiles, fetch_player_strengths,
    fetch_points_breakdown, fetch_game_log, fetch_compare_table,
    fetch_player_boom_bust, fetch_player_comps,
)

# Re-export prospect functions from prospects.py
from .prospects import (  # noqa: F401
    fetch_prospects, fetch_prospect_years, fetch_prospect_profile,
    _fetch_college_for_prospect, fetch_prospect_comps,
    fetch_prospect_tiers, fetch_prospects_compare,
    fetch_prospect_scores, fetch_draft_class_analytics,
)

# Re-export college functions from college.py
from .college import (  # noqa: F401
    fetch_college_players, fetch_college_player_profile,
    fetch_college_filter_options, fetch_college_breakouts,
    fetch_college_efficiency, fetch_college_leaders,
    fetch_college_trends, fetch_college_rankings,
    fetch_college_streaks, fetch_college_stock_watch,
    fetch_college_scarcity, fetch_college_consistency,
    fetch_college_workload, fetch_college_dual_threat,
    fetch_college_snap_efficiency, fetch_college_aging_curves,
    fetch_college_records, fetch_college_season_recap,
    fetch_college_season_awards, fetch_college_stat_explorer,
)

def init_waitlist_table():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS waitlist (
                email TEXT UNIQUE NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """)
        conn.commit()


def add_to_waitlist(email: str) -> dict:
    email = email.strip().lower()
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        return {"status": "error", "message": "invalid email format"}
    with get_db() as conn:
        try:
            conn.execute("INSERT INTO waitlist (email) VALUES (?)", (email,))
            conn.commit()
            result = {"status": "ok"}
        except sqlite3.IntegrityError:
            result = {"status": "duplicate"}
        return result


# ---------------------------------------------------------------------------
# Aging Curves
# ---------------------------------------------------------------------------

def fetch_aging_curves(position="WR"):
    """Return position-average PPG by age and top individual player career arcs.

    Returns:
        {
            baseline: [{age, avg_ppg, count}],
            players: [{name, team, position, points: [{age, ppg, season}]}]
        }
    """
    position = position.strip().upper()
    if position not in FANTASY_POSITIONS:
        position = "WR"

    with get_db() as conn:

        # --- Baseline: average PPG per age bucket for this position ---
        # Each player-season = one data point: (age_at_season, ppg_that_season)
        # We compute age at each season from birth_date or the stored age column
        # Since we store current age, we back-compute: age_at_season = current_age - (latest_season - season)
        latest_season_row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        latest_season = latest_season_row[0] if latest_season_row and latest_season_row[0] else 2024

        rows = conn.execute("""
            SELECT
                p.player_id,
                p.full_name,
                p.team,
                p.position,
                p.age,
                s.season,
                COUNT(DISTINCT s.week) as games,
                SUM(s.fantasy_points_ppr) as total_ppr
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE p.position = ?
              AND p.age IS NOT NULL
              AND s.fantasy_points_ppr IS NOT NULL
            GROUP BY p.player_id, s.season
            HAVING games >= 4
            ORDER BY total_ppr DESC
        """, (position,)).fetchall()

        # Compute age-at-season for each player-season
        # age_at_season = current_age - (latest_season - season)
        baseline_buckets = {}  # age -> [ppg_values]
        player_arcs = {}  # player_id -> {name, team, points: [{age, ppg, season}]}

        for r in rows:
            player_id = r[0]
            name = r[1]
            team = r[2]
            pos = r[3]
            current_age = r[4]
            season = r[5]
            games = r[6]
            total_ppr = r[7] or 0

            age_at_season = round(current_age - (latest_season - season))
            if age_at_season < 19 or age_at_season > 42:
                continue

            ppg = round(total_ppr / max(games, 1), 1)

            # Add to baseline
            if age_at_season not in baseline_buckets:
                baseline_buckets[age_at_season] = []
            baseline_buckets[age_at_season].append(ppg)

            # Add to player arc
            if player_id not in player_arcs:
                player_arcs[player_id] = {
                    "name": name,
                    "team": team,
                    "position": pos,
                    "career_ppg": 0,
                    "total_ppr": 0,
                    "total_games": 0,
                    "points": [],
                }
            player_arcs[player_id]["points"].append({
                "age": age_at_season,
                "ppg": ppg,
                "season": season,
            })
            player_arcs[player_id]["total_ppr"] += total_ppr
            player_arcs[player_id]["total_games"] += games

        # Build baseline (min 5 player-seasons per age bucket)
        baseline = []
        for age in sorted(baseline_buckets.keys()):
            values = baseline_buckets[age]
            if len(values) >= 5:
                baseline.append({
                    "age": age,
                    "avg_ppg": round(sum(values) / len(values), 1),
                    "count": len(values),
                })

        # Pick top 10 players by career PPG (min 2 seasons)
        for pid, arc in player_arcs.items():
            arc["career_ppg"] = round(arc["total_ppr"] / max(arc["total_games"], 1), 1)
            arc["points"].sort(key=lambda x: x["age"])

        top_players = sorted(
            [arc for arc in player_arcs.values() if len(arc["points"]) >= 2],
            key=lambda x: x["career_ppg"],
            reverse=True,
        )[:10]

        # Clean up output
        players_out = []
        for arc in top_players:
            players_out.append({
                "name": arc["name"],
                "team": arc["team"],
                "position": arc["position"],
                "career_ppg": arc["career_ppg"],
                "points": arc["points"],
            })

        return {"baseline": baseline, "players": players_out}


# ---------------------------------------------------------------------------
# Positional Heat Maps
# ---------------------------------------------------------------------------

# Stat groups per position — each stat has (sql_expression_or_key, display_label, higher_is_better)
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

    with get_db() as conn:

        # Determine season
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else 2024

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
            d["int_rate"] = _safe_div((d.get("turnovers") or 0) * 100, d.get("attempts"), 1)
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


# ---------------------------------------------------------------------------
# Formula Store
# ---------------------------------------------------------------------------

def init_formula_store_tables():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS formula_store (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                position_tags TEXT NOT NULL DEFAULT '[]',
                stat_weights TEXT NOT NULL DEFAULT '{}',
                creator_name TEXT NOT NULL DEFAULT 'anonymous',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                rating_sum REAL NOT NULL DEFAULT 0,
                rating_count INTEGER NOT NULL DEFAULT 0
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS formula_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                formula_id INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                review TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (formula_id) REFERENCES formula_store(id)
            )
        """)
        conn.commit()

        # Seed formulas if table is empty
        count = conn.execute("SELECT COUNT(*) FROM formula_store").fetchone()[0]
        if count == 0:
            _seed_formula_store(conn)



def _seed_formula_store(conn):
    import json
    seeds = [
        {
            "name": "PPR Workhorse",
            "description": "Identifies high-volume PPR assets. Weights receptions and targets heavily alongside rushing volume.",
            "position_tags": ["RB", "WR"],
            "stat_weights": {"receptions": 30, "targets": 25, "rushing_yards": 20, "receiving_yards": 15, "rushing_tds": 10},
            "creator_name": "Razzle Labs",
            "rating_sum": 23, "rating_count": 5,
        },
        {
            "name": "Alpha WR Score",
            "description": "Finds true WR1 alphas. Combines target share, air yards, and touchdown upside.",
            "position_tags": ["WR"],
            "stat_weights": {"targets": 25, "receiving_yards": 25, "receiving_tds": 20, "receptions": 15, "receiving_yards_after_catch": 10, "receiving_fumbles_lost": -5},
            "creator_name": "Razzle Labs",
            "rating_sum": 29, "rating_count": 6,
        },
        {
            "name": "Dual Threat QB",
            "description": "Scores QBs who contribute with both arm and legs. Rushing floor matters in fantasy.",
            "position_tags": ["QB"],
            "stat_weights": {"passing_yards": 25, "passing_tds": 20, "rushing_yards": 25, "rushing_tds": 15, "interceptions": -15},
            "creator_name": "Razzle Labs",
            "rating_sum": 17, "rating_count": 4,
        },
        {
            "name": "Bellcow Index",
            "description": "Pure rushing workload. Identifies true three-down backs with volume and TD upside.",
            "position_tags": ["RB"],
            "stat_weights": {"rushing_yards": 30, "carries": 25, "rushing_tds": 20, "rushing_first_downs": 15, "rushing_fumbles_lost": -10},
            "creator_name": "Razzle Labs",
            "rating_sum": 22, "rating_count": 5,
        },
        {
            "name": "TD Machine",
            "description": "Pure touchdown upside across all scoring methods. Boom-or-bust by design.",
            "position_tags": ["QB", "RB", "WR", "TE"],
            "stat_weights": {"passing_tds": 30, "rushing_tds": 35, "receiving_tds": 35},
            "creator_name": "Razzle Labs",
            "rating_sum": 17, "rating_count": 4,
        },
        {
            "name": "Target Hog",
            "description": "Volume is king in PPR. Finds players commanding the highest target share on their team.",
            "position_tags": ["WR", "TE", "RB"],
            "stat_weights": {"targets": 35, "receptions": 30, "receiving_yards": 20, "receiving_first_downs": 15},
            "creator_name": "Razzle Labs",
            "rating_sum": 19, "rating_count": 4,
        },
        {
            "name": "TE Premium",
            "description": "Identifies the rare TEs who actually produce. Receiving volume + TD upside weighted for TE scarcity.",
            "position_tags": ["TE"],
            "stat_weights": {"receptions": 30, "receiving_yards": 25, "targets": 20, "receiving_tds": 25},
            "creator_name": "Razzle Labs",
            "rating_sum": 24, "rating_count": 5,
        },
        {
            "name": "Dynasty Value Score",
            "description": "Long-term dynasty asset evaluation. Balances current production with age-adjusted upside.",
            "position_tags": ["QB", "RB", "WR", "TE"],
            "stat_weights": {"fantasy_points_ppr": 35, "receiving_yards": 20, "rushing_yards": 15, "passing_yards": 15, "receptions": 15},
            "creator_name": "Razzle Labs",
            "rating_sum": 27, "rating_count": 6,
        },
        {
            "name": "YAC Monster",
            "description": "Explosive playmakers who create after the catch. The fun players to own.",
            "position_tags": ["WR", "RB", "TE"],
            "stat_weights": {"receiving_yards_after_catch": 40, "receiving_yards": 25, "receptions": 20, "receiving_tds": 15},
            "creator_name": "Razzle Labs",
            "rating_sum": 19, "rating_count": 4,
        },
        {
            "name": "Pocket Passer",
            "description": "Traditional pocket QB evaluation. Pure passing efficiency and volume.",
            "position_tags": ["QB"],
            "stat_weights": {"passing_yards": 30, "passing_tds": 30, "completions": 15, "interceptions": -25},
            "creator_name": "Razzle Labs",
            "rating_sum": 18, "rating_count": 4,
        },
    ]

    for s in seeds:
        conn.execute(
            """INSERT INTO formula_store (name, description, position_tags, stat_weights, creator_name, rating_sum, rating_count)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (s["name"], s["description"], json.dumps(s["position_tags"]),
             json.dumps(s["stat_weights"]), s["creator_name"],
             s["rating_sum"], s["rating_count"]),
        )
    conn.commit()


def publish_formula(name: str, description: str, position_tags: list,
                    stat_weights: dict, creator_name: str) -> dict:
    import json
    with get_db() as conn:
        try:
            cur = conn.execute(
                """INSERT INTO formula_store (name, description, position_tags, stat_weights, creator_name)
                   VALUES (?, ?, ?, ?, ?)""",
                (name.strip(), description.strip(),
                 json.dumps(position_tags), json.dumps(stat_weights),
                 creator_name.strip() or "anonymous"),
            )
            conn.commit()
            formula_id = cur.lastrowid
            result = {"status": "ok", "id": formula_id}
        except Exception as e:
            result = {"status": "error", "message": str(e)}
        return result


def fetch_formula_store(position: str = "", sort: str = "newest",
                        search: str = "", limit: int = 50, offset: int = 0) -> dict:
    import json
    with get_db() as conn:

        where_parts = []
        params = []

        if position and position.upper() != "ALL":
            where_parts.append("position_tags LIKE ?")
            params.append(f'%"{position.upper()}"%')

        if search:
            where_parts.append("name LIKE ?")
            params.append(f"%{search}%")

        where_sql = ("WHERE " + " AND ".join(where_parts)) if where_parts else ""

        sort_map = {
            "newest": "created_at DESC",
            "rating": "CASE WHEN rating_count > 0 THEN rating_sum / rating_count ELSE 0 END DESC",
            "popular": "rating_count DESC",
        }
        order_sql = sort_map.get(sort, "created_at DESC")

        rows = conn.execute(f"""
            SELECT id, name, description, position_tags, creator_name, created_at,
                   rating_sum, rating_count
            FROM formula_store
            {where_sql}
            ORDER BY {order_sql}
            LIMIT ? OFFSET ?
        """, params + [limit, offset]).fetchall()

        count_row = conn.execute(f"SELECT COUNT(*) FROM formula_store {where_sql}", params).fetchone()
        total = count_row[0] if count_row else 0

        formulas = []
        for r in rows:
            avg_rating = round(r[6] / r[7], 1) if r[7] > 0 else 0
            formulas.append({
                "id": r[0],
                "name": r[1],
                "description": r[2],
                "position_tags": json.loads(r[3]) if r[3] else [],
                "creator_name": r[4],
                "created_at": r[5],
                "avg_rating": avg_rating,
                "rating_count": r[7],
            })

        return {"formulas": formulas, "total": total}


def get_formula_detail(formula_id: int) -> dict:
    import json
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, name, description, position_tags, stat_weights, creator_name, created_at, rating_sum, rating_count FROM formula_store WHERE id = ?",
            (formula_id,),
        ).fetchone()

        if not row:
            return {"status": "not_found"}

        avg_rating = round(row[7] / row[8], 1) if row[8] > 0 else 0
        return {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "position_tags": json.loads(row[3]) if row[3] else [],
            "stat_weights": json.loads(row[4]) if row[4] else {},
            "creator_name": row[5],
            "created_at": row[6],
            "avg_rating": avg_rating,
            "rating_count": row[8],
        }


def rate_formula(formula_id: int, rating: int, review: str = "") -> dict:
    if rating < 1 or rating > 5:
        return {"status": "error", "message": "rating must be 1-5"}

    with get_db() as conn:
        # Check formula exists
        exists = conn.execute("SELECT id FROM formula_store WHERE id = ?", (formula_id,)).fetchone()
        if not exists:
            return {"status": "not_found"}

        conn.execute(
            "INSERT INTO formula_ratings (formula_id, rating, review) VALUES (?, ?, ?)",
            (formula_id, rating, review.strip()),
        )
        conn.execute(
            "UPDATE formula_store SET rating_sum = rating_sum + ?, rating_count = rating_count + 1 WHERE id = ?",
            (rating, formula_id),
        )
        conn.commit()
        return {"status": "ok"}


# ---------------------------------------------------------------------------
# Analytics — lightweight page view tracking
# ---------------------------------------------------------------------------

def _init_analytics_table():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS pageviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """)
        conn.commit()


def log_pageview(page: str):
    try:
        with get_db() as conn:
            conn.execute("INSERT INTO pageviews (page) VALUES (?)", (page[:200],))
            conn.commit()
    except Exception:
        pass


def get_analytics_summary() -> dict:
    try:
        with get_db() as conn:
            total = conn.execute("SELECT COUNT(*) FROM pageviews").fetchone()[0]
            by_page = conn.execute(
                "SELECT page, COUNT(*) as views FROM pageviews GROUP BY page ORDER BY views DESC LIMIT 20"
            ).fetchall()
            by_day = conn.execute(
                "SELECT DATE(created_at) as day, COUNT(*) as views FROM pageviews GROUP BY day ORDER BY day DESC LIMIT 30"
            ).fetchall()
            return {
                "total": total,
                "by_page": [{"page": r[0], "views": r[1]} for r in by_page],
                "by_day": [{"day": r[0], "views": r[1]} for r in by_day],
            }
    except Exception:
        return {"total": 0, "by_page": [], "by_day": []}


# ---------------------------------------------------------------------------
# Trade Value Model
def fetch_trade_values(player_ids):
    """Return trade values for a list of player IDs."""
    if not player_ids:
        return []

    with get_db() as conn:

        # Get latest season
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        latest_season = row[0] if row and row[0] else 2024

        placeholders = ",".join(["?"] * len(player_ids))

        # Fetch player bio + season PPR PPG
        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            LEFT JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.player_id IN ({placeholders})
            GROUP BY p.player_id
        """
        params = [latest_season] + list(player_ids)
        rows = conn.execute(query, params).fetchall()

        results = []
        for r in rows:
            pid = r[0]
            name = r[1] or "Unknown"
            pos = r[2] or "WR"
            team = r[3] or "FA"
            age = r[4]
            total_ppr = r[5] or 0
            games = r[6] or 0
            ppg = round(total_ppr / games, 2) if games > 0 else 0.0

            prod_score = round(_production_value(ppg, pos), 1)
            age_score = round(_age_value(age, pos), 1)
            scarcity_score = round(_scarcity_value(pos), 1)
            trade_value = compute_trade_value(ppg, age, pos)

            results.append({
                "player_id": pid,
                "full_name": name,
                "position": pos,
                "team": team,
                "age": age,
                "ppg": ppg,
                "games": games,
                "trade_value": trade_value,
                "components": {
                    "production": prod_score,
                    "age": age_score,
                    "scarcity": scarcity_score,
                },
            })

        return results
def fetch_pick_values(year=2025, rounds=4, teams=12):
    """Return trade values for all dynasty draft picks."""
    picks = []
    for rd in range(1, rounds + 1):
        for pk in range(1, teams + 1):
            overall = (rd - 1) * teams + pk
            label = f"{year} {rd}.{pk:02d}"
            picks.append({
                "pick_label": label,
                "year": year,
                "round": rd,
                "pick": pk,
                "overall": overall,
                "trade_value": _pick_value(overall),
            })
    return picks
def fetch_roster_value(player_ids):
    """Compute roster-level dynasty value analysis."""
    players = fetch_trade_values(player_ids)
    if not players:
        return {
            "players": [],
            "total_value": 0,
            "positional_totals": {},
            "average_age": 0,
            "grade": "F",
            "competing_status": "rebuilding",
        }

    total_value = sum(p["trade_value"] for p in players)

    pos_totals = {}
    pos_counts = {}
    ages = []
    for p in players:
        pos = p["position"]
        pos_totals[pos] = pos_totals.get(pos, 0) + p["trade_value"]
        pos_counts[pos] = pos_counts.get(pos, 0) + 1
        if p["age"]:
            ages.append(p["age"])

    avg_age = round(sum(ages) / len(ages), 1) if ages else 0

    return {
        "players": players,
        "total_value": round(total_value, 1),
        "positional_totals": pos_totals,
        "positional_counts": pos_counts,
        "average_age": avg_age,
        "grade": _roster_grade(total_value),
        "competing_status": _competing_status(avg_age, total_value),
    }
def fetch_dynasty_rankings(position=None, limit=200):
    """Return top dynasty-relevant players ranked by dynasty value with tiers."""
    limit = max(1, min(300, limit))
    with get_db() as conn:

        # Get latest season
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        latest_season = row[0] if row and row[0] else 2024

        pos_filter = ""
        params = [latest_season]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
              {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 3
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, params).fetchall()

        results = []
        for r in rows:
            pid = r[0]
            name = r[1] or "Unknown"
            pos = r[2] or "WR"
            team = r[3] or "FA"
            age = r[4]
            headshot = r[5] or ""
            total_ppr = r[6] or 0
            games = r[7] or 0
            ppg = round(total_ppr / games, 2) if games > 0 else 0.0

            trade_value = compute_trade_value(ppg, age, pos)
            tier = _assign_tier(trade_value)

            results.append({
                "player_id": pid,
                "full_name": name,
                "position": pos,
                "team": team,
                "age": age,
                "headshot_url": headshot,
                "ppg": ppg,
                "games": games,
                "dynasty_value": trade_value,
                "tier": tier,
                "tier_label": _TIER_LABELS[tier],
            })

        # Sort by dynasty value descending
        results.sort(key=lambda x: x["dynasty_value"], reverse=True)
        results = results[:limit]

        # Group by tier for convenience
        tiers = {}
        for p in results:
            t = p["tier"]
            if t not in tiers:
                tiers[t] = {"tier": t, "label": _TIER_LABELS[t], "players": []}
            tiers[t]["players"].append(p)

        return {
            "players": results,
            "tiers": [tiers[t] for t in sorted(tiers.keys())],
            "total": len(results),
            "season": latest_season,
        }


# ---------------------------------------------------------------------------
# Stat Leaders — top performers by category
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
    with get_db() as conn:
        # Determine season
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else 2024

        pos_upper = position.strip().upper() if position else None
        if pos_upper and pos_upper not in ("QB", "RB", "WR", "TE"):
            pos_upper = None

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
                        AVG(m.value) as stat_value
                    FROM players p
                    JOIN player_week_stats s
                        ON s.player_id = p.player_id AND s.season = ?
                    JOIN player_week_metrics m
                        ON m.player_id = p.player_id AND m.season = ? AND m.week = s.week
                        AND m.metric_key = 'target_share'
                    WHERE p.fantasy_relevant = 1
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


# ---------------------------------------------------------------------------
# Featured Analysis — curated lists for home page
# ---------------------------------------------------------------------------

def fetch_featured():
    """Return 3 curated player lists for home page widgets (cached 5 min)."""
    def _query():
        return _fetch_featured_uncached()
    return _cached("featured", _query)


def _fetch_featured_uncached():
    with get_db() as conn:

        # Get latest season
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        season = row[0] if row and row[0] else 2024

        results = {}

        # 1. Dynasty Risers — young + productive (PPG/age ratio)
        try:
            rows = conn.execute("""
                SELECT p.player_id, p.full_name, p.position, p.team, p.age,
                       SUM(s.fantasy_points_ppr) as total_ppr,
                       COUNT(DISTINCT s.week) as games
                FROM players p
                JOIN player_week_stats s ON p.player_id = s.player_id AND s.season = ?
                WHERE p.position IN ('QB','RB','WR','TE')
                  AND p.age IS NOT NULL AND p.age > 0 AND p.age <= 26
                  AND p.fantasy_relevant = 1
                GROUP BY p.player_id
                HAVING games >= 8
                ORDER BY (total_ppr / games) DESC
                LIMIT 5
            """, (season,)).fetchall()

            results["dynasty_risers"] = [{
                "name": r[1], "position": r[2], "team": r[3], "age": round(r[4]),
                "ppg": round(r[5] / r[6], 1) if r[6] else 0, "games": r[6]
            } for r in rows]
        except Exception:
            results["dynasty_risers"] = []

        # 2. Rookie Big Board — top prospects by draft pick
        try:
            row2 = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
            draft_year = row2[0] if row2 and row2[0] else 2025

            rows = conn.execute("""
                SELECT c.player_name, c.position, c.school,
                       d.draft_round, d.draft_pick, d.team as draft_team
                FROM combine_data c
                LEFT JOIN draft_picks d
                    ON c.draft_year = d.season
                    AND LOWER(REPLACE(c.player_name, ' ', '')) = LOWER(REPLACE(d.player_name, ' ', ''))
                    AND c.position = d.position
                WHERE c.draft_year = ?
                  AND c.position IN ('QB','RB','WR','TE')
                ORDER BY COALESCE(d.draft_pick, 999) ASC, c.player_name ASC
                LIMIT 5
            """, (draft_year,)).fetchall()

            results["rookie_board"] = [{
                "name": r[0], "position": r[1], "school": r[2],
                "round": r[3], "pick": r[4], "team": r[5] or "TBD"
            } for r in rows]
            results["draft_year"] = draft_year
        except Exception:
            results["rookie_board"] = []

        # 3. Breakout Candidates — high target share, below-average PPG (upside)
        try:
            rows = conn.execute("""
                SELECT p.player_id, p.full_name, p.position, p.team, p.age,
                       SUM(s.fantasy_points_ppr) as total_ppr,
                       COUNT(DISTINCT s.week) as games,
                       SUM(s.targets) as total_targets,
                       SUM(s.receptions) as total_rec
                FROM players p
                JOIN player_week_stats s ON p.player_id = s.player_id AND s.season = ?
                WHERE p.position IN ('WR','TE')
                  AND p.age IS NOT NULL AND p.age <= 27
                  AND p.fantasy_relevant = 1
                GROUP BY p.player_id
                HAVING games >= 8 AND total_targets >= 50
                ORDER BY (CAST(total_targets AS FLOAT) / games) DESC
                LIMIT 5
            """, (season,)).fetchall()

            results["breakout_candidates"] = [{
                "name": r[1], "position": r[2], "team": r[3], "age": round(r[4]),
                "ppg": round(r[5] / r[6], 1) if r[6] else 0,
                "tpg": round(r[7] / r[6], 1) if r[6] else 0,
                "games": r[6]
            } for r in rows]
        except Exception:
            results["breakout_candidates"] = []

        results["season"] = season
        return results
def fetch_positional_scarcity(season=None):
    """Return PPG drop-off data by position for scarcity analysis."""
    with get_db() as conn:
        # Determine season + available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

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


# ---------------------------------------------------------------------------
# Breakout Candidate Finder — opportunity vs production gap
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


def fetch_breakout_candidates(season=None, position=None, limit=50):
    """Return players ranked by breakout potential (opportunity-production gap)."""
    with get_db() as conn:
        # Determine season + available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        pos_filter = ""
        params = [season]
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
        ts_rows = conn.execute(f"""
            SELECT player_id, AVG(stat_value) as avg_ts
            FROM player_week_metrics
            WHERE player_id IN ({placeholders})
              AND season = ?
              AND stat_key = 'target_share'
            GROUP BY player_id
        """, pids + [season]).fetchall()
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


# ---------------------------------------------------------------------------
# Buy Low / Sell High — Dynasty value mismatch finder
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
    with get_db() as conn:
        # Determine season + available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

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
                SUM(s.turnovers) as turnovers,
                SUM(s.receiving_yards_after_catch) as yac
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
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
            turnovers = r[17] or 0
            yac = r[18] or 0
            pos = r[2] or "WR"
            age = r[4]

            # Compute dynasty value for ranking
            dynasty_val = compute_trade_value(ppg, age, pos)

            # Compute position-specific efficiency metrics
            if pos == "QB":
                yards_per_att = round(pass_yds / pass_att, 2) if pass_att > 0 else 0
                td_rate = round((pass_tds / pass_att) * 100, 2) if pass_att > 0 else 0
                int_rate = round((turnovers / pass_att) * 100, 2) if pass_att > 0 else 0
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


# ---------------------------------------------------------------------------
# Stat Explorer — configurable scatter plot data
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
    with get_db() as conn:
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]

        if not season:
            season = available_seasons[0] if available_seasons else 2024

        # Validate stat names
        if x_stat not in (_EXPLORER_CORE | _EXPLORER_RATE):
            x_stat = "targets_g"
        if y_stat not in (_EXPLORER_CORE | _EXPLORER_RATE):
            y_stat = "ppg"

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


# ---------------------------------------------------------------------------
# Aging Curves — PPG by age per position
# ---------------------------------------------------------------------------

def fetch_aging_curves(season=None, position=None):
    """Return aging curve data: average PPG by age for each position,
    plus individual player data points for the selected season."""
    with get_db() as conn:
        # Determine available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        positions = [position] if position and position in FANTASY_POSITIONS else list(FANTASY_POSITIONS)
        latest_season = available_seasons[0] if available_seasons else 2024
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


def fetch_weekly_heatmap(season=None, position=None, limit=40):
    """Return weekly fantasy scores for top players in a grid format.

    Returns player rows with per-week PPG values and positional percentile
    thresholds for color coding.
    """
    with get_db() as conn:
        # Determine available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        positions = [position] if position and position in FANTASY_POSITIONS else list(FANTASY_POSITIONS)

        # Get available weeks for this season
        week_rows = conn.execute(
            "SELECT DISTINCT week FROM player_week_stats WHERE season = ? ORDER BY week",
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
                WHERE season = ? AND player_id IN ({placeholders})
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


def fetch_target_distribution(season=None, team=None):
    """Return target and carry distribution by team.

    For each team, returns players sorted by targets (or carries for RB-heavy),
    with their share of team totals.
    """
    with get_db() as conn:
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        teams_filter = ""
        params = [season]
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


# ---------------------------------------------------------------------------
# Matchup Heatmap — Fantasy Points Allowed by Defense per Position
# ---------------------------------------------------------------------------

def fetch_matchup_heatmap(season=None, position=None):
    """Return avg fantasy points allowed per game by each defense to each position.

    Computes from opponent_team in player_week_stats: group all player scores
    by opponent_team and position to find how many PPR points each defense allows.
    """
    with get_db() as conn:
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

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
            WHERE season = ? AND opponent_team IS NOT NULL AND opponent_team != ''
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

        # Top scorers against each defense (detail view) — only when position specified
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


# ---------------------------------------------------------------------------
# Snap Count & Usage Trends — weekly snap% with risers/fallers
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


def fetch_usage_trends(season=None, position=None, window=5, limit=30):
    """Return players with weekly snap% trends, identifying risers and fallers."""
    with get_db() as conn:
        # Determine season + available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        pos_filter = ""
        params = [season]
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
              AND p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
              AND s.offense_pct IS NOT NULL
              AND s.offense_pct > 0
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
        from collections import defaultdict
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
        window = max(3, min(window, 18))
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

            first_avg = sum(w["snap_pct"] for w in first_half) / len(first_half)
            second_avg = sum(w["snap_pct"] for w in second_half) / len(second_half)
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
        import random as _rng
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


# ── Year-over-Year Comparison ─────────────────────────────────────────────

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
    with get_db() as conn:
        # Determine available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]

        if not season:
            season = available_seasons[0] if available_seasons else 2024

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


# ---------------------------------------------------------------------------
# Air Yards Dashboard
# ---------------------------------------------------------------------------

_AIR_BUY_LOW_ANNOTATIONS = ["due for more", "regression coming", "breakout loading", "undervalued", "TD drought ending"]
_AIR_SELL_HIGH_ANNOTATIONS = ["efficiency mirage", "TD luck", "volume mirage", "overperforming air yards", "regression risk"]


def fetch_air_yards(season=None, position=None, limit=25):
    """Air yards leaderboard with regression indicators (air yards rank vs PPG rank delta)."""
    with get_db() as conn:
        # Determine available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]

        if not season:
            season = available_seasons[0] if available_seasons else 2024

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


def fetch_redzone_usage(season=None, position=None, limit=30):
    """Return goal-line usage leaders and TD-dependent players."""
    with get_db() as conn:
        # Determine season + available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        pos_filter = ""
        params = [season]
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


# ---------------------------------------------------------------------------
# Phase 83: Efficiency Rankings
# ---------------------------------------------------------------------------

_EFFICIENCY_ANNOTATIONS = [
    "does more with less",
    "ruthlessly efficient",
    "every touch counts",
    "the definition of productive",
    "maximum output, minimum waste",
    "quality over quantity",
    "the efficient engine",
    "always moving the chains",
    "no wasted motion",
    "elite touch efficiency",
]

_VOLUME_ANNOTATIONS = [
    "the workhorse",
    "bellcow workload",
    "carries the offense",
    "volume is king",
    "opportunity monster",
    "the focal point",
    "featured weapon",
    "snap-eating machine",
    "the engine room",
    "fed early and often",
]


def fetch_efficiency_rankings(season=None, position=None, limit=30):
    """Return efficiency rankings: most efficient and volume kings."""
    with get_db() as conn:
        # Determine season + available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        pos_filter = ""
        params = [season]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games,
                SUM(s.targets) as targets,
                SUM(s.carries) as carries,
                SUM(s.receptions) as receptions,
                SUM(s.receiving_yards) as receiving_yards,
                SUM(s.rushing_yards) as rushing_yards,
                SUM(s.receiving_air_yards) as receiving_air_yards,
                SUM(s.receiving_tds) as rec_tds,
                SUM(s.rushing_tds) as rush_tds,
                SUM(s.passing_tds) as pass_tds
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
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
                "most_efficient": [],
                "volume_kings": [],
            }

        players = []
        for r in rows:
            pid = r[0]
            games = r[6] or 1
            total_ppr = r[5] or 0
            targets = r[7] or 0
            carries = r[8] or 0
            receptions = r[9] or 0
            rec_yards = r[10] or 0
            rush_yards = r[11] or 0
            air_yards = r[12] or 0
            rec_tds = r[13] or 0
            rush_tds = r[14] or 0
            pass_tds = r[15] or 0
            pos = r[2] or "RB"

            # Opportunities = targets + carries (for QBs: attempts/carries)
            opportunities = targets + carries
            touches = receptions + carries
            total_yards = rec_yards + rush_yards
            total_tds = rec_tds + rush_tds + pass_tds

            # Skip players with too few opportunities
            if opportunities < 50:
                continue

            ppg = round(total_ppr / games, 2)
            ppo = round(total_ppr / opportunities, 2) if opportunities > 0 else 0
            ypt = round(total_yards / touches, 2) if touches > 0 else 0
            catch_rate = round(receptions / targets * 100, 1) if targets > 0 else 0
            yac_per_rec = round(max(0, (rec_yards - air_yards)) / receptions, 2) if receptions > 0 else 0
            td_rate = round(total_tds / touches * 100, 1) if touches > 0 else 0

            players.append({
                "player_id": pid,
                "name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "headshot_url": r[4] or "",
                "ppg": ppg,
                "games": games,
                "opportunities": opportunities,
                "touches": touches,
                "ppo": ppo,
                "yards_per_touch": ypt,
                "catch_rate": catch_rate,
                "yac_per_rec": yac_per_rec,
                "td_rate": td_rate,
                "total_tds": total_tds,
            })

        # Compute PPO percentile for efficiency grade
        ppo_values = sorted([p["ppo"] for p in players])
        n = len(ppo_values)
        for p in players:
            if n == 0:
                p["grade"] = "C"
                continue
            rank = sum(1 for v in ppo_values if v < p["ppo"])
            percentile = rank / n * 100
            if percentile >= 95:
                p["grade"] = "A+"
            elif percentile >= 85:
                p["grade"] = "A"
            elif percentile >= 70:
                p["grade"] = "B"
            elif percentile >= 45:
                p["grade"] = "C"
            elif percentile >= 25:
                p["grade"] = "D"
            else:
                p["grade"] = "F"

        # Most Efficient: highest PPO
        most_efficient = sorted(players, key=lambda x: x["ppo"], reverse=True)[:limit]
        for i, p in enumerate(most_efficient):
            p["annotation"] = _EFFICIENCY_ANNOTATIONS[i % len(_EFFICIENCY_ANNOTATIONS)]

        # Volume Kings: most opportunities (with grade for context)
        volume_kings = sorted(players, key=lambda x: x["opportunities"], reverse=True)[:limit]
        for i, p in enumerate(volume_kings):
            p["annotation"] = _VOLUME_ANNOTATIONS[i % len(_VOLUME_ANNOTATIONS)]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "most_efficient": most_efficient,
            "volume_kings": volume_kings,
        }


# ---------------------------------------------------------------------------
# Consistency Rankings
# ---------------------------------------------------------------------------

_ROCK_SOLID_ANNOTATIONS = [
    "metronome", "bankable", "set-and-forget", "steady Eddie",
    "reliable as gravity", "floor merchant", "plug and play",
    "boring in the best way", "autopilot", "old faithful",
    "cash money", "no-drama zone", "Swiss watch", "rock of ages",
    "comfort blanket", "ironclad", "steady hand", "safe harbor",
]

_WILD_CARD_ANNOTATIONS = [
    "buckle up", "boom or bust", "volatility king", "rollercoaster",
    "white-knuckle ride", "high variance", "feast or famine",
    "chaos merchant", "gambler's delight", "ceiling chaser",
    "weekly coin flip", "heart attack starter", "spicy lineup play",
    "start at your own risk", "living on the edge", "the wild card",
]


def fetch_consistency_rankings(season=None, position=None, limit=30):
    """Return consistency rankings: rock solid (low CoV) and wild cards (high CoV)."""
    import math

    with get_db() as conn:
        # Determine season + available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        pos_filter = ""
        params = [season]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        # Get weekly fantasy points per player
        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team,
                p.headshot_url,
                s.fantasy_points_ppr, s.week
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
              {pos_filter}
            ORDER BY p.player_id, s.week
        """
        rows = conn.execute(query, params).fetchall()

        if not rows:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "rock_solid": [],
                "wild_cards": [],
            }

        # Group weekly scores by player
        from collections import defaultdict
        player_info = {}
        player_weeks = defaultdict(list)
        for r in rows:
            pid = r[0]
            if pid not in player_info:
                player_info[pid] = {
                    "player_id": pid,
                    "name": r[1] or "Unknown",
                    "position": r[2] or "RB",
                    "team": r[3] or "FA",
                    "headshot_url": r[4] or "",
                }
            pts = r[5] or 0
            player_weeks[pid].append(pts)

        # Compute stats for players with >= 6 games
        players = []
        for pid, weeks in player_weeks.items():
            if len(weeks) < 6:
                continue

            info = player_info[pid]
            n = len(weeks)
            mean = sum(weeks) / n
            if mean < 2:
                continue  # Skip very low scorers (irrelevant)

            variance = sum((w - mean) ** 2 for w in weeks) / (n - 1)
            stddev = math.sqrt(variance)
            cov = round(stddev / mean, 3) if mean > 0 else 0

            # Floor (10th percentile) and ceiling (90th percentile)
            sorted_weeks = sorted(weeks)
            floor_idx = max(0, int(n * 0.1))
            ceil_idx = min(n - 1, int(n * 0.9))
            floor_val = round(sorted_weeks[floor_idx], 1)
            ceil_val = round(sorted_weeks[ceil_idx], 1)
            score_range = round(ceil_val - floor_val, 1)

            players.append({
                **info,
                "ppg": round(mean, 2),
                "stddev": round(stddev, 2),
                "cov": cov,
                "floor": floor_val,
                "ceiling": ceil_val,
                "range": score_range,
                "games": n,
            })

        # Grade by INVERSE CoV percentile (lower CoV = better grade)
        cov_values = sorted([p["cov"] for p in players])
        total = len(cov_values)
        for p in players:
            if total == 0:
                p["grade"] = "C"
                continue
            # Lower CoV = more consistent = higher percentile
            rank = sum(1 for v in cov_values if v > p["cov"])
            percentile = rank / total * 100
            if percentile >= 95:
                p["grade"] = "A+"
            elif percentile >= 85:
                p["grade"] = "A"
            elif percentile >= 70:
                p["grade"] = "B"
            elif percentile >= 45:
                p["grade"] = "C"
            elif percentile >= 25:
                p["grade"] = "D"
            else:
                p["grade"] = "F"

        # Rock Solid: lowest CoV (most consistent)
        rock_solid = sorted(players, key=lambda x: x["cov"])[:limit]
        for i, p in enumerate(rock_solid):
            p["annotation"] = _ROCK_SOLID_ANNOTATIONS[i % len(_ROCK_SOLID_ANNOTATIONS)]

        # Wild Cards: highest CoV (most volatile)
        wild_cards = sorted(players, key=lambda x: x["cov"], reverse=True)[:limit]
        for i, p in enumerate(wild_cards):
            p["annotation"] = _WILD_CARD_ANNOTATIONS[i % len(_WILD_CARD_ANNOTATIONS)]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "rock_solid": rock_solid,
            "wild_cards": wild_cards,
        }


# ---------------------------------------------------------------------------
# Strength of Schedule
# ---------------------------------------------------------------------------

_SOS_SUPPRESSED_ANNOTATIONS = [
    "elite despite the gauntlet",
    "schedule-proof stud",
    "numbers held up vs the toughest",
    "buy low window closing",
    "did this vs killers every week",
    "imagine this on a soft schedule",
    "undervalued because of SOS",
    "the real deal",
    "proven against the best",
    "schedule gets easier — watch out",
]

_SOS_INFLATED_ANNOTATIONS = [
    "padded stats alert",
    "soft schedule did the heavy lifting",
    "sell high before reality hits",
    "regression coming",
    "cupcake schedule inflated these",
    "numbers won't repeat",
    "schedule-dependent production",
    "beneficiary of easy matchups",
    "don't trust these numbers",
    "buyer beware",
]


def fetch_strength_of_schedule(season=None, position=None, limit=30):
    """Compute per-player strength of schedule using opponent PPG-allowed-by-position.

    For each player, look at every opponent they faced, compute the avg PPG that
    defense allows at the player's position, then compare actual PPG to schedule
    difficulty.  Split into schedule_suppressed (hardest SOS) and schedule_inflated
    (easiest SOS).
    """
    with get_db() as conn:
        row = conn.execute(
            "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
        ).fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        # Step 1: Build defense PPG-allowed-by-position grid for this season
        def_rows = conn.execute("""
            SELECT s.opponent_team, p.position,
                   COALESCE(SUM(s.fantasy_points_ppr), 0) as total_ppr,
                   COUNT(DISTINCT s.week) as games
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
            GROUP BY s.opponent_team, p.position
        """, [season]).fetchall()

        # defense_ppg[team][position] = avg PPG allowed
        defense_ppg = {}
        for r in def_rows:
            team, pos, total, games = r[0], r[1], r[2], r[3]
            if games <= 0:
                continue
            if team not in defense_ppg:
                defense_ppg[team] = {}
            defense_ppg[team][pos] = round(total / games, 2)

        # League average PPG allowed per position
        league_avg = {}
        for pos in ("QB", "RB", "WR", "TE"):
            vals = [defense_ppg[t][pos] for t in defense_ppg if pos in defense_ppg[t]]
            league_avg[pos] = sum(vals) / len(vals) if vals else 0

        # Step 2: Get per-player weekly data (opponent per week)
        pos_filter = ""
        params = [season]
        if position and position.upper() in FANTASY_POSITIONS:
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        player_rows = conn.execute(f"""
            SELECT s.player_id, p.full_name, p.position, p.headshot_url,
                   s.opponent_team, s.fantasy_points_ppr, s.week,
                   s.team
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND p.fantasy_relevant = 1
              AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
              {pos_filter}
            ORDER BY s.player_id, s.week
        """, params).fetchall()

        if not player_rows:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "schedule_suppressed": [],
                "schedule_inflated": [],
            }

        # Step 3: Aggregate per player
        from collections import defaultdict
        player_agg = defaultdict(lambda: {
            "opp_ppg_list": [], "total_pts": 0, "games": 0, "team": "",
        })
        player_info = {}

        for r in player_rows:
            pid = r[0]
            name, pos, headshot, opp = r[1], r[2], r[3], r[4]
            pts, week, team = r[5] or 0, r[6], r[7] or ""

            if pid not in player_info:
                player_info[pid] = {
                    "player_id": pid,
                    "name": name,
                    "position": pos,
                    "headshot_url": headshot,
                }

            opp_allows = defense_ppg.get(opp, {}).get(pos, league_avg.get(pos, 0))
            d = player_agg[pid]
            d["opp_ppg_list"].append(opp_allows)
            d["total_pts"] += pts
            d["games"] += 1
            d["team"] = team  # last team seen

        # Step 4: Compute metrics per player
        players = []
        for pid, d in player_agg.items():
            games = d["games"]
            if games < 6:
                continue
            ppg = round(d["total_pts"] / games, 1)
            if ppg < 2:
                continue

            avg_opp_ppg = round(sum(d["opp_ppg_list"]) / len(d["opp_ppg_list"]), 1)
            info = player_info[pid]
            pos = info["position"]

            # sos_delta: positive = harder schedule (opponents allow LESS than avg)
            sos_delta = round(league_avg.get(pos, 0) - avg_opp_ppg, 1)

            players.append({
                "player_id": pid,
                "name": info["name"],
                "position": pos,
                "headshot_url": info["headshot_url"],
                "team": d["team"],
                "ppg": ppg,
                "avg_opp_ppg": avg_opp_ppg,
                "sos_delta": sos_delta,
                "games": games,
            })

        if not players:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "schedule_suppressed": [],
                "schedule_inflated": [],
            }

        # Step 5: Rank by schedule difficulty (sos_delta desc = hardest schedule)
        players.sort(key=lambda x: x["sos_delta"], reverse=True)
        for i, p in enumerate(players):
            p["sos_rank"] = i + 1

        # Grade by schedule difficulty percentile (A+ = hardest schedule)
        total = len(players)
        for i, p in enumerate(players):
            percentile = ((total - 1 - i) / max(total - 1, 1)) * 100
            if percentile >= 95:
                p["grade"] = "A+"
            elif percentile >= 85:
                p["grade"] = "A"
            elif percentile >= 70:
                p["grade"] = "B"
            elif percentile >= 45:
                p["grade"] = "C"
            elif percentile >= 25:
                p["grade"] = "D"
            else:
                p["grade"] = "F"

        # Schedule Suppressed: hardest schedule (highest sos_delta)
        suppressed = [p for p in players if p["sos_delta"] > 0]
        suppressed = sorted(suppressed, key=lambda x: x["sos_delta"], reverse=True)[:limit]
        for i, p in enumerate(suppressed):
            p["annotation"] = _SOS_SUPPRESSED_ANNOTATIONS[i % len(_SOS_SUPPRESSED_ANNOTATIONS)]

        # Schedule Inflated: easiest schedule (most negative sos_delta)
        inflated = [p for p in players if p["sos_delta"] < 0]
        inflated = sorted(inflated, key=lambda x: x["sos_delta"])[:limit]
        for i, p in enumerate(inflated):
            p["annotation"] = _SOS_INFLATED_ANNOTATIONS[i % len(_SOS_INFLATED_ANNOTATIONS)]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "schedule_suppressed": suppressed,
            "schedule_inflated": inflated,
        }


# ---------------------------------------------------------------------------
# Phase 87: Dynasty Stock Watch
# ---------------------------------------------------------------------------

_RISING_ANNOTATIONS = [
    "buy window open",
    "metrics say undervalued",
    "stock price climbing",
    "the data backs the hype",
    "quietly outperforming",
    "sleeper alert",
    "the numbers don't lie",
    "upside not priced in",
    "production exceeds perception",
    "dynasty steal",
]

_FALLING_ANNOTATIONS = [
    "sell window closing",
    "metrics say overvalued",
    "stock price dropping",
    "production doesn't match price",
    "quietly underperforming",
    "red flags in the data",
    "regression candidate",
    "buy the name, not the stats",
    "perception exceeds production",
    "dynasty fade",
]


def fetch_stock_watch(season=None, position=None, limit=30):
    """Composite dynasty stock watch — blends efficiency, consistency, SOS, and PPG
    into a 0-100 stock score.  Rising = undervalued (stock > PPG rank).
    Falling = overvalued (stock < PPG rank)."""
    import math
    from collections import defaultdict

    with get_db() as conn:
        row = conn.execute(
            "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
        ).fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        pos_filter = ""
        params = [season]
        if position and position.upper() in FANTASY_POSITIONS:
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        # ---- Gather weekly data per player ----
        rows = conn.execute(f"""
            SELECT s.player_id, p.full_name, p.position, p.team,
                   p.headshot_url, p.age,
                   s.fantasy_points_ppr, s.targets, s.carries,
                   s.opponent_team, s.week
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND p.fantasy_relevant = 1
              AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
              {pos_filter}
            ORDER BY s.player_id, s.week
        """, params).fetchall()

        if not rows:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "rising": [],
                "falling": [],
            }

        # ---- Build defense PPG-allowed grid for SOS ----
        def_rows = conn.execute("""
            SELECT s.opponent_team, p.position,
                   COALESCE(SUM(s.fantasy_points_ppr), 0) as total_ppr,
                   COUNT(DISTINCT s.week) as games
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
            GROUP BY s.opponent_team, p.position
        """, [season]).fetchall()

        defense_ppg = {}
        for r in def_rows:
            team, pos, total, games = r[0], r[1], r[2], r[3]
            if games <= 0:
                continue
            if team not in defense_ppg:
                defense_ppg[team] = {}
            defense_ppg[team][pos] = round(total / games, 2)

        league_avg = {}
        for pos in ("QB", "RB", "WR", "TE"):
            vals = [defense_ppg[t][pos] for t in defense_ppg if pos in defense_ppg[t]]
            league_avg[pos] = sum(vals) / len(vals) if vals else 0

        # ---- Aggregate per player ----
        player_info = {}
        player_weeks = defaultdict(list)  # weekly fantasy pts
        player_opps = defaultdict(lambda: {"targets": 0, "carries": 0, "total_pts": 0, "games": 0})
        player_sos = defaultdict(list)  # opp ppg allowed per week

        for r in rows:
            pid = r[0]
            if pid not in player_info:
                player_info[pid] = {
                    "player_id": pid,
                    "name": r[1] or "Unknown",
                    "position": r[2] or "RB",
                    "team": r[3] or "FA",
                    "headshot_url": r[4] or "",
                    "age": r[5],
                }

            pts = r[6] or 0
            targets = r[7] or 0
            carries = r[8] or 0
            opp = r[9] or ""
            pos = r[2] or "RB"

            player_weeks[pid].append(pts)
            d = player_opps[pid]
            d["targets"] += targets
            d["carries"] += carries
            d["total_pts"] += pts
            d["games"] += 1

            opp_allows = defense_ppg.get(opp, {}).get(pos, league_avg.get(pos, 0))
            player_sos[pid].append(opp_allows)

        # ---- Compute metrics per player (min 6 games, 2 PPG) ----
        players = []
        for pid, weeks in player_weeks.items():
            n = len(weeks)
            if n < 6:
                continue
            info = player_info[pid]
            opps_d = player_opps[pid]
            total_pts = opps_d["total_pts"]
            games = opps_d["games"]
            ppg = round(total_pts / games, 2) if games > 0 else 0
            if ppg < 2:
                continue

            # Efficiency: PPO
            opportunities = opps_d["targets"] + opps_d["carries"]
            ppo = round(total_pts / opportunities, 2) if opportunities > 50 else None

            # Consistency: CoV
            mean = sum(weeks) / n
            variance = sum((w - mean) ** 2 for w in weeks) / (n - 1) if n > 1 else 0
            stddev = math.sqrt(variance)
            cov = round(stddev / mean, 3) if mean > 0 else None

            # SOS: avg opp ppg allowed
            sos_list = player_sos[pid]
            avg_opp_ppg = sum(sos_list) / len(sos_list) if sos_list else 0
            pos = info["position"]
            sos_delta = round(league_avg.get(pos, 0) - avg_opp_ppg, 1)

            players.append({
                **info,
                "ppg": ppg,
                "games": games,
                "ppo": ppo,
                "cov": cov,
                "sos_delta": sos_delta,
            })

        if not players:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "rising": [],
                "falling": [],
            }

        # ---- Compute percentiles for each metric ----
        # PPG percentile
        ppg_sorted = sorted([p["ppg"] for p in players])
        n_total = len(ppg_sorted)

        # PPO percentile (only players with enough opps)
        ppo_vals = sorted([p["ppo"] for p in players if p["ppo"] is not None])
        n_ppo = len(ppo_vals)

        # Inverse CoV percentile (lower CoV = higher percentile)
        cov_vals = sorted([p["cov"] for p in players if p["cov"] is not None])
        n_cov = len(cov_vals)

        # SOS delta percentile (higher delta = harder schedule = higher percentile)
        sos_sorted = sorted([p["sos_delta"] for p in players])
        n_sos = len(sos_sorted)

        def percentile_rank(val, sorted_vals, count):
            if count == 0:
                return 50
            rank = sum(1 for v in sorted_vals if v < val)
            return round(rank / count * 100, 1)

        def grade_from_percentile(pct):
            if pct >= 95:
                return "A+"
            elif pct >= 85:
                return "A"
            elif pct >= 70:
                return "B"
            elif pct >= 45:
                return "C"
            elif pct >= 25:
                return "D"
            return "F"

        for p in players:
            ppg_pct = percentile_rank(p["ppg"], ppg_sorted, n_total)
            ppo_pct = percentile_rank(p["ppo"], ppo_vals, n_ppo) if p["ppo"] is not None else 50
            # Inverse CoV: lower CoV = better, so count values ABOVE
            cov_pct = (sum(1 for v in cov_vals if v > p["cov"]) / n_cov * 100) if p["cov"] is not None and n_cov > 0 else 50
            sos_pct = percentile_rank(p["sos_delta"], sos_sorted, n_sos)

            # Composite stock score: 25% each
            stock_score = round(ppo_pct * 0.25 + cov_pct * 0.25 + sos_pct * 0.25 + ppg_pct * 0.25)

            p["stock_score"] = stock_score
            p["ppg_pct"] = round(ppg_pct)
            p["efficiency_grade"] = grade_from_percentile(ppo_pct)
            p["consistency_grade"] = grade_from_percentile(cov_pct)
            p["sos_grade"] = grade_from_percentile(sos_pct)
            # Stock delta: positive = undervalued (stock > production rank)
            p["stock_delta"] = stock_score - round(ppg_pct)

        # ---- Split into rising (undervalued) and falling (overvalued) ----
        rising = sorted(
            [p for p in players if p["stock_delta"] > 0],
            key=lambda x: x["stock_delta"], reverse=True
        )[:limit]
        for i, p in enumerate(rising):
            p["annotation"] = _RISING_ANNOTATIONS[i % len(_RISING_ANNOTATIONS)]

        falling = sorted(
            [p for p in players if p["stock_delta"] < 0],
            key=lambda x: x["stock_delta"]
        )[:limit]
        for i, p in enumerate(falling):
            p["annotation"] = _FALLING_ANNOTATIONS[i % len(_FALLING_ANNOTATIONS)]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "rising": rising,
            "falling": falling,
        }


# ---------------------------------------------------------------------------
# Opportunity Share & Dominator Rating
# ---------------------------------------------------------------------------

_ALPHA_ANNOTATIONS = [
    "the bellcow", "volume king", "carries the load",
    "target hog", "workload monster", "focal point",
    "run-game anchor", "snap machine", "every-down back",
    "route-tree monopoly",
]

_DOMINATOR_ANNOTATIONS = [
    "receiving alpha", "production dominator", "stat magnet",
    "yards vacuum", "TD machine", "target conversion king",
    "yardage engine", "reception monster", "air-game anchor",
    "route assassin",
]


def fetch_opportunity_share(season=None, position=None, limit=30):
    """Return opportunity share leaders (alpha dogs) and dominator rating leaders.

    Opportunity Share = (player targets + carries) / (team targets + carries) * 100
    Dominator Rating = ((player rec yards / team rec yards) + (player rec TDs / team rec TDs)) / 2 * 100
    For RB/QB: Rush Dominator = (player rush yards / team rush yards) * 100
    """
    from collections import defaultdict

    with get_db() as conn:
        row = conn.execute(
            "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
        ).fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        pos_filter = ""
        params = [season]
        if position and position.upper() in FANTASY_POSITIONS:
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        # Gather per-player season totals
        rows = conn.execute(f"""
            SELECT s.player_id, p.full_name, p.position, p.team,
                   p.headshot_url, p.age,
                   COALESCE(SUM(s.targets), 0) as total_targets,
                   COALESCE(SUM(s.carries), 0) as total_carries,
                   COALESCE(SUM(s.receiving_yards), 0) as total_rec_yards,
                   COALESCE(SUM(s.receiving_tds), 0) as total_rec_tds,
                   COALESCE(SUM(s.rushing_yards), 0) as total_rush_yards,
                   COALESCE(SUM(s.rushing_tds), 0) as total_rush_tds,
                   COALESCE(SUM(s.fantasy_points_ppr), 0) as total_pts,
                   COUNT(DISTINCT s.week) as games
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND p.fantasy_relevant = 1
              {pos_filter}
            GROUP BY s.player_id
        """, params).fetchall()

        if not rows:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "alpha_dogs": [],
                "dominators": [],
            }

        # Build team totals from ALL positions (unfiltered) for correct opp_share
        team_totals = defaultdict(lambda: {
            "targets": 0, "carries": 0,
            "rec_yards": 0, "rec_tds": 0,
            "rush_yards": 0, "rush_tds": 0,
        })
        tt_rows = conn.execute("""
            SELECT p.team,
                   COALESCE(SUM(s.targets), 0),
                   COALESCE(SUM(s.carries), 0),
                   COALESCE(SUM(s.receiving_yards), 0),
                   COALESCE(SUM(s.receiving_tds), 0),
                   COALESCE(SUM(s.rushing_yards), 0),
                   COALESCE(SUM(s.rushing_tds), 0)
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND p.fantasy_relevant = 1
            GROUP BY p.team
        """, [season]).fetchall()
        for tr in tt_rows:
            t = team_totals[tr[0] or "FA"]
            t["targets"] = tr[1]
            t["carries"] = tr[2]
            t["rec_yards"] = tr[3]
            t["rec_tds"] = tr[4]
            t["rush_yards"] = tr[5]
            t["rush_tds"] = tr[6]

        players = []
        for r in rows:
            team = r[3] or "FA"
            targets = r[6]
            carries = r[7]
            rec_yards = r[8]
            rec_tds = r[9]
            rush_yards = r[10]
            rush_tds = r[11]
            total_pts = r[12]
            games = r[13]

            players.append({
                "player_id": r[0],
                "name": r[1] or "Unknown",
                "position": r[2] or "RB",
                "team": team,
                "headshot_url": r[4] or "",
                "age": r[5],
                "targets": targets,
                "carries": carries,
                "rec_yards": rec_yards,
                "rec_tds": rec_tds,
                "rush_yards": rush_yards,
                "rush_tds": rush_tds,
                "total_pts": total_pts,
                "games": games,
            })

        # Compute opportunity share and dominator rating per player
        for p in players:
            team = p["team"]
            t = team_totals[team]
            games = p["games"]
            ppg = round(p["total_pts"] / games, 2) if games > 0 else 0
            p["ppg"] = ppg

            total_opps = p["targets"] + p["carries"]
            p["total_opps"] = total_opps
            p["targets_per_game"] = round(p["targets"] / games, 1) if games > 0 else 0
            p["carries_per_game"] = round(p["carries"] / games, 1) if games > 0 else 0

            # Opportunity share
            team_opps = t["targets"] + t["carries"]
            p["opp_share"] = round(total_opps / team_opps * 100, 1) if team_opps > 0 else 0

            # Dominator rating (WR/TE: receiving; RB/QB: rushing)
            pos = p["position"]
            if pos in ("WR", "TE"):
                rec_yd_share = (p["rec_yards"] / t["rec_yards"] * 100) if t["rec_yards"] > 0 else 0
                rec_td_share = (p["rec_tds"] / t["rec_tds"] * 100) if t["rec_tds"] > 0 else 0
                p["dominator_rating"] = round((rec_yd_share + rec_td_share) / 2, 1)
                p["rec_yd_share"] = round(rec_yd_share, 1)
                p["rec_td_share"] = round(rec_td_share, 1)
                p["rush_share"] = None
            else:
                rush_share = (p["rush_yards"] / t["rush_yards"] * 100) if t["rush_yards"] > 0 else 0
                p["rush_share"] = round(rush_share, 1)
                p["dominator_rating"] = round(rush_share, 1)
                p["rec_yd_share"] = None
                p["rec_td_share"] = None

        # Filter: min 30 opportunities, min 4 games
        filtered = [p for p in players if p["total_opps"] >= 30 and p["games"] >= 4]

        # Alpha Dogs: highest opportunity share
        alpha_dogs = sorted(filtered, key=lambda x: x["opp_share"], reverse=True)[:limit]
        for i, p in enumerate(alpha_dogs):
            p["annotation"] = _ALPHA_ANNOTATIONS[i % len(_ALPHA_ANNOTATIONS)]

        # Dominators: highest dominator rating
        dominators = sorted(filtered, key=lambda x: x["dominator_rating"], reverse=True)[:limit]
        for i, p in enumerate(dominators):
            p["annotation"] = _DOMINATOR_ANNOTATIONS[i % len(_DOMINATOR_ANNOTATIONS)]

        # Clean up internal fields before returning
        clean_keys = ["rec_yards", "rec_tds", "rush_yards", "rush_tds", "total_pts"]
        for lst in (alpha_dogs, dominators):
            for p in lst:
                for k in clean_keys:
                    p.pop(k, None)

        return {
            "season": season,
            "available_seasons": available_seasons,
            "alpha_dogs": alpha_dogs,
            "dominators": dominators,
        }


# ---------------------------------------------------------------------------
# Player Report Card — Composite Fantasy GPA
# ---------------------------------------------------------------------------

_HONOR_ANNOTATIONS = [
    "straight A student", "dean's list", "valedictorian",
    "top of the class", "gold star", "the complete package",
    "all-around elite", "no weaknesses", "fantasy thoroughbred",
    "draft day steal",
]

_NEEDS_WORK_ANNOTATIONS = [
    "needs tutoring", "incomplete grade", "see me after class",
    "red flags on tape", "underperforming", "check the film",
    "room for growth", "bought the hype?", "regression candidate",
    "the numbers don't lie",
]


def fetch_report_cards(season=None, position=None, limit=25):
    """Composite player report card — aggregates efficiency, consistency,
    SOS, stock score, and opportunity share into a Fantasy GPA (A+ to F).

    GPA = weighted average of 5 percentiles:
      20% efficiency (PPO), 20% consistency (inv CoV), 20% SOS difficulty,
      20% PPG, 20% opportunity share.
    """
    import math
    from collections import defaultdict

    with get_db() as conn:
        row = conn.execute(
            "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
        ).fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        pos_filter = ""
        params = [season]
        if position and position.upper() in FANTASY_POSITIONS:
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        # Gather weekly data per player
        rows = conn.execute(f"""
            SELECT s.player_id, p.full_name, p.position, p.team,
                   p.headshot_url, p.age,
                   s.fantasy_points_ppr, s.targets, s.carries,
                   s.receiving_yards, s.receiving_tds,
                   s.rushing_yards,
                   s.opponent_team, s.week
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND p.fantasy_relevant = 1
              AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
              {pos_filter}
            ORDER BY s.player_id, s.week
        """, params).fetchall()

        if not rows:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "honor_roll": [],
                "needs_improvement": [],
            }

        # Build defense PPG-allowed grid for SOS
        def_rows = conn.execute("""
            SELECT s.opponent_team, p.position,
                   COALESCE(SUM(s.fantasy_points_ppr), 0) as total_ppr,
                   COUNT(DISTINCT s.week) as games
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
            GROUP BY s.opponent_team, p.position
        """, [season]).fetchall()

        defense_ppg = {}
        for r in def_rows:
            team, pos, total, games = r[0], r[1], r[2], r[3]
            if games <= 0:
                continue
            if team not in defense_ppg:
                defense_ppg[team] = {}
            defense_ppg[team][pos] = round(total / games, 2)

        league_avg = {}
        for pos in ("QB", "RB", "WR", "TE"):
            vals = [defense_ppg[t][pos] for t in defense_ppg if pos in defense_ppg[t]]
            league_avg[pos] = sum(vals) / len(vals) if vals else 0

        # Build team totals from ALL positions (unfiltered) for correct opp_share
        team_totals = defaultdict(lambda: {"targets": 0, "carries": 0, "rec_yards": 0, "rec_tds": 0, "rush_yards": 0})
        tt_rows = conn.execute("""
            SELECT p.team,
                   COALESCE(SUM(s.targets), 0),
                   COALESCE(SUM(s.carries), 0),
                   COALESCE(SUM(s.receiving_yards), 0),
                   COALESCE(SUM(s.receiving_tds), 0),
                   COALESCE(SUM(s.rushing_yards), 0)
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND p.fantasy_relevant = 1
            GROUP BY p.team
        """, [season]).fetchall()
        for tr in tt_rows:
            t = team_totals[tr[0] or "FA"]
            t["targets"] = tr[1]
            t["carries"] = tr[2]
            t["rec_yards"] = tr[3]
            t["rec_tds"] = tr[4]
            t["rush_yards"] = tr[5]

        # Aggregate per player
        player_info = {}
        player_weeks = defaultdict(list)
        player_opps = defaultdict(lambda: {
            "targets": 0, "carries": 0, "total_pts": 0, "games": 0,
            "rec_yards": 0, "rec_tds": 0, "rush_yards": 0,
        })
        player_sos = defaultdict(list)

        for r in rows:
            pid = r[0]
            if pid not in player_info:
                player_info[pid] = {
                    "player_id": pid,
                    "name": r[1] or "Unknown",
                    "position": r[2] or "RB",
                    "team": r[3] or "FA",
                    "headshot_url": r[4] or "",
                    "age": r[5],
                }

            pts = r[6] or 0
            targets = r[7] or 0
            carries = r[8] or 0
            rec_yards = r[9] or 0
            rec_tds = r[10] or 0
            rush_yards = r[11] or 0
            opp = r[12] or ""
            pos = r[2] or "RB"

            player_weeks[pid].append(pts)
            d = player_opps[pid]
            d["targets"] += targets
            d["carries"] += carries
            d["total_pts"] += pts
            d["games"] += 1
            d["rec_yards"] += rec_yards
            d["rec_tds"] += rec_tds
            d["rush_yards"] += rush_yards

            opp_allows = defense_ppg.get(opp, {}).get(pos, league_avg.get(pos, 0))
            player_sos[pid].append(opp_allows)

        # Compute metrics per player (min 6 games, 2 PPG, 50 opps)
        players = []
        for pid, weeks in player_weeks.items():
            n = len(weeks)
            if n < 6:
                continue
            info = player_info[pid]
            opps_d = player_opps[pid]
            total_pts = opps_d["total_pts"]
            games = opps_d["games"]
            ppg = round(total_pts / games, 2) if games > 0 else 0
            if ppg < 2:
                continue

            opportunities = opps_d["targets"] + opps_d["carries"]
            if opportunities < 50:
                continue

            # Efficiency: PPO
            ppo = round(total_pts / opportunities, 2) if opportunities > 0 else 0

            # Consistency: CoV (Bessel's correction)
            mean = sum(weeks) / n
            variance = sum((w - mean) ** 2 for w in weeks) / (n - 1) if n > 1 else 0
            stddev = math.sqrt(variance)
            cov = round(stddev / mean, 3) if mean > 0 else 999

            # SOS: avg opp ppg allowed
            sos_list = player_sos[pid]
            avg_opp_ppg = sum(sos_list) / len(sos_list) if sos_list else 0
            pos = info["position"]
            sos_delta = round(league_avg.get(pos, 0) - avg_opp_ppg, 1)

            # Opportunity share
            team = info["team"]
            tt = team_totals[team]
            team_opps = tt["targets"] + tt["carries"]
            opp_share = round(opportunities / team_opps * 100, 1) if team_opps > 0 else 0

            # Dominator rating
            if pos in ("WR", "TE"):
                rec_yd_share = (opps_d["rec_yards"] / tt["rec_yards"] * 100) if tt["rec_yards"] > 0 else 0
                rec_td_share = (opps_d["rec_tds"] / tt["rec_tds"] * 100) if tt["rec_tds"] > 0 else 0
                dom_rating = round((rec_yd_share + rec_td_share) / 2, 1)
            else:
                dom_rating = round((opps_d["rush_yards"] / tt["rush_yards"] * 100), 1) if tt["rush_yards"] > 0 else 0

            players.append({
                **info,
                "ppg": ppg,
                "games": games,
                "ppo": ppo,
                "cov": cov,
                "sos_delta": sos_delta,
                "opp_share": opp_share,
                "dom_rating": dom_rating,
            })

        if not players:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "honor_roll": [],
                "needs_improvement": [],
            }

        # Compute percentiles
        ppg_sorted = sorted([p["ppg"] for p in players])
        ppo_sorted = sorted([p["ppo"] for p in players])
        cov_vals = sorted([p["cov"] for p in players])
        sos_sorted = sorted([p["sos_delta"] for p in players])
        opp_sorted = sorted([p["opp_share"] for p in players])
        n_total = len(players)

        def percentile_rank(val, sorted_vals, count):
            if count == 0:
                return 50
            rank = sum(1 for v in sorted_vals if v < val)
            return round(rank / count * 100, 1)

        def grade_from_percentile(pct):
            if pct >= 95:
                return "A+"
            elif pct >= 85:
                return "A"
            elif pct >= 75:
                return "B+"
            elif pct >= 65:
                return "B"
            elif pct >= 50:
                return "C+"
            elif pct >= 35:
                return "C"
            elif pct >= 25:
                return "D"
            return "F"

        for p in players:
            ppg_pct = percentile_rank(p["ppg"], ppg_sorted, n_total)
            ppo_pct = percentile_rank(p["ppo"], ppo_sorted, n_total)
            # Inverse CoV: lower CoV = better
            cov_pct = round(sum(1 for v in cov_vals if v > p["cov"]) / n_total * 100, 1) if n_total > 0 else 50
            sos_pct = percentile_rank(p["sos_delta"], sos_sorted, n_total)
            opp_pct = percentile_rank(p["opp_share"], opp_sorted, n_total)

            # Composite GPA: 20% each of 5 dimensions
            gpa_pct = round(ppo_pct * 0.20 + cov_pct * 0.20 + sos_pct * 0.20 + ppg_pct * 0.20 + opp_pct * 0.20)

            p["gpa_pct"] = gpa_pct
            p["gpa_grade"] = grade_from_percentile(gpa_pct)
            p["efficiency_grade"] = grade_from_percentile(ppo_pct)
            p["consistency_grade"] = grade_from_percentile(cov_pct)
            p["sos_grade"] = grade_from_percentile(sos_pct)
            p["stock_score"] = round(ppo_pct * 0.25 + cov_pct * 0.25 + sos_pct * 0.25 + ppg_pct * 0.25)

        # Honor Roll: highest composite GPA
        honor_roll = sorted(players, key=lambda x: x["gpa_pct"], reverse=True)[:limit]
        for i, p in enumerate(honor_roll):
            p["annotation"] = _HONOR_ANNOTATIONS[i % len(_HONOR_ANNOTATIONS)]

        # Needs Improvement: lowest composite GPA
        needs_improvement = sorted(players, key=lambda x: x["gpa_pct"])[:limit]
        for i, p in enumerate(needs_improvement):
            p["annotation"] = _NEEDS_WORK_ANNOTATIONS[i % len(_NEEDS_WORK_ANNOTATIONS)]

        # Clean up internal fields
        for lst in (honor_roll, needs_improvement):
            for p in lst:
                p.pop("cov", None)
                p.pop("ppo", None)
                p.pop("sos_delta", None)

        return {
            "season": season,
            "available_seasons": available_seasons,
            "honor_roll": honor_roll,
            "needs_improvement": needs_improvement,
        }


_AWARD_ANNOTATIONS = {
    "mvp": "the total package",
    "most_efficient": "every touch counts",
    "iron_man": "set it and forget it",
    "schedule_survivor": "earned every point",
    "volume_king": "feed me the rock",
    "breakout_star": "remember the name",
    "rising_stock": "buy window closing",
    "dominator": "alpha of the pack",
    "redzone_king": "money in the paint",
    "best_floor": "the safest bet",
}


def fetch_season_awards(season=None, position=None):
    """Fantasy Season Superlatives — data-driven awards across all metric systems.

    Awards: MVP (highest GPA), Most Efficient (PPO), Iron Man (lowest CoV),
    Schedule Survivor (PPG x SOS difficulty), Volume King (opp share),
    Breakout Star (age-weighted opp share), Rising Stock (stock delta),
    Dominator (dominator rating), Red Zone King (GL TDs), Best Floor (10th pctile).
    """
    import math
    from collections import defaultdict

    with get_db() as conn:
        row = conn.execute(
            "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
        ).fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        pos_filter = ""
        params = [season]
        if position and position.upper() in FANTASY_POSITIONS:
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        # Gather weekly data per player
        rows = conn.execute(f"""
            SELECT s.player_id, p.full_name, p.position, p.team,
                   p.headshot_url, p.age,
                   s.fantasy_points_ppr, s.targets, s.carries,
                   s.receiving_yards, s.receiving_tds,
                   s.rushing_yards,
                   s.opponent_team, s.week
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND p.fantasy_relevant = 1
              AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
              {pos_filter}
            ORDER BY s.player_id, s.week
        """, params).fetchall()

        if not rows:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "awards": [],
            }

        # Build defense PPG-allowed grid for SOS
        def_rows = conn.execute("""
            SELECT s.opponent_team, p.position,
                   COALESCE(SUM(s.fantasy_points_ppr), 0) as total_ppr,
                   COUNT(DISTINCT s.week) as games
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
            GROUP BY s.opponent_team, p.position
        """, [season]).fetchall()

        defense_ppg = {}
        for r in def_rows:
            team, pos, total, games = r[0], r[1], r[2], r[3]
            if games <= 0:
                continue
            if team not in defense_ppg:
                defense_ppg[team] = {}
            defense_ppg[team][pos] = round(total / games, 2)

        league_avg = {}
        for pos in ("QB", "RB", "WR", "TE"):
            vals = [defense_ppg[t][pos] for t in defense_ppg if pos in defense_ppg[t]]
            league_avg[pos] = sum(vals) / len(vals) if vals else 0

        # Goal-line stats from PBP table
        table_check = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='player_season_pbp'"
        ).fetchone()
        gl_lookup = {}
        if table_check:
            pids = list(set(r[0] for r in rows))
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

        # Aggregate per player
        player_info = {}
        player_weeks = defaultdict(list)
        player_opps = defaultdict(lambda: {
            "targets": 0, "carries": 0, "total_pts": 0, "games": 0,
            "rec_yards": 0, "rec_tds": 0, "rush_yards": 0,
        })
        player_sos = defaultdict(list)

        # Build team totals from ALL positions (unfiltered) for correct opp_share
        team_totals = defaultdict(lambda: {
            "targets": 0, "carries": 0, "rec_yards": 0,
            "rec_tds": 0, "rush_yards": 0,
        })
        tt_rows = conn.execute("""
            SELECT p.team,
                   COALESCE(SUM(s.targets), 0),
                   COALESCE(SUM(s.carries), 0),
                   COALESCE(SUM(s.receiving_yards), 0),
                   COALESCE(SUM(s.receiving_tds), 0),
                   COALESCE(SUM(s.rushing_yards), 0)
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND p.fantasy_relevant = 1
            GROUP BY p.team
        """, [season]).fetchall()
        for tr in tt_rows:
            t = team_totals[tr[0] or "FA"]
            t["targets"] = tr[1]
            t["carries"] = tr[2]
            t["rec_yards"] = tr[3]
            t["rec_tds"] = tr[4]
            t["rush_yards"] = tr[5]

        for r in rows:
            pid = r[0]
            if pid not in player_info:
                player_info[pid] = {
                    "player_id": pid,
                    "name": r[1] or "Unknown",
                    "position": r[2] or "RB",
                    "team": r[3] or "FA",
                    "headshot_url": r[4] or "",
                    "age": r[5],
                }

            pts = r[6] or 0
            targets = r[7] or 0
            carries = r[8] or 0
            rec_yards = r[9] or 0
            rec_tds = r[10] or 0
            rush_yards = r[11] or 0
            opp = r[12] or ""
            pos = r[2] or "RB"

            player_weeks[pid].append(pts)
            d = player_opps[pid]
            d["targets"] += targets
            d["carries"] += carries
            d["total_pts"] += pts
            d["games"] += 1
            d["rec_yards"] += rec_yards
            d["rec_tds"] += rec_tds
            d["rush_yards"] += rush_yards

            opp_allows = defense_ppg.get(opp, {}).get(pos, league_avg.get(pos, 0))
            player_sos[pid].append(opp_allows)

        # Compute metrics per player (min 6 games, 2 PPG)
        players = []
        for pid, weeks in player_weeks.items():
            n = len(weeks)
            if n < 6:
                continue
            info = player_info[pid]
            opps_d = player_opps[pid]
            total_pts = opps_d["total_pts"]
            games = opps_d["games"]
            ppg = round(total_pts / games, 2) if games > 0 else 0
            if ppg < 2:
                continue

            opportunities = opps_d["targets"] + opps_d["carries"]

            # Efficiency: PPO
            ppo = round(total_pts / opportunities, 2) if opportunities > 0 else 0

            # Consistency: CoV (Bessel's correction)
            mean = sum(weeks) / n
            variance = sum((w - mean) ** 2 for w in weeks) / (n - 1) if n > 1 else 0
            stddev = math.sqrt(variance)
            cov = round(stddev / mean, 3) if mean > 0 else 999

            # Floor: 10th percentile weekly score
            sorted_weeks = sorted(weeks)
            floor_idx = max(0, int(n * 0.1))
            floor_val = round(sorted_weeks[floor_idx], 1)

            # SOS
            sos_list = player_sos[pid]
            avg_opp_ppg = sum(sos_list) / len(sos_list) if sos_list else 0
            pos = info["position"]
            sos_delta = round(league_avg.get(pos, 0) - avg_opp_ppg, 1)

            # Opportunity share
            team = info["team"]
            tt = team_totals[team]
            team_opps = tt["targets"] + tt["carries"]
            opp_share = round(opportunities / team_opps * 100, 1) if team_opps > 0 else 0

            # Dominator rating
            if pos in ("WR", "TE"):
                rec_yd_share = (opps_d["rec_yards"] / tt["rec_yards"] * 100) if tt["rec_yards"] > 0 else 0
                rec_td_share = (opps_d["rec_tds"] / tt["rec_tds"] * 100) if tt["rec_tds"] > 0 else 0
                dom_rating = round((rec_yd_share + rec_td_share) / 2, 1)
            else:
                dom_rating = round((opps_d["rush_yards"] / tt["rush_yards"] * 100), 1) if tt["rush_yards"] > 0 else 0

            # Goal-line TDs
            gl = gl_lookup.get(pid, {"gl_carries": 0, "gl_targets": 0, "gl_tds": 0})

            # Age for breakout scoring
            age = info["age"] or 26

            players.append({
                **info,
                "ppg": ppg,
                "games": games,
                "ppo": ppo,
                "cov": cov,
                "floor": floor_val,
                "sos_delta": sos_delta,
                "opp_share": opp_share,
                "dom_rating": dom_rating,
                "gl_tds": gl["gl_tds"],
                "opportunities": opportunities,
                "age": age,
            })

        if not players:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "awards": [],
            }

        # Compute percentiles
        n_total = len(players)
        ppg_sorted = sorted([p["ppg"] for p in players])
        ppo_sorted = sorted([p["ppo"] for p in players])
        cov_vals = sorted([p["cov"] for p in players])
        sos_sorted = sorted([p["sos_delta"] for p in players])
        opp_sorted = sorted([p["opp_share"] for p in players])

        def pct_rank(val, sorted_vals):
            rank = sum(1 for v in sorted_vals if v < val)
            return round(rank / n_total * 100, 1) if n_total > 0 else 50

        def grade_from_percentile(pct):
            if pct >= 95:
                return "A+"
            elif pct >= 85:
                return "A"
            elif pct >= 75:
                return "B+"
            elif pct >= 65:
                return "B"
            elif pct >= 50:
                return "C+"
            elif pct >= 35:
                return "C"
            elif pct >= 25:
                return "D"
            return "F"

        for p in players:
            ppg_pct = pct_rank(p["ppg"], ppg_sorted)
            ppo_pct = pct_rank(p["ppo"], ppo_sorted)
            cov_pct = round(sum(1 for v in cov_vals if v > p["cov"]) / n_total * 100, 1) if n_total > 0 else 50
            sos_pct = pct_rank(p["sos_delta"], sos_sorted)
            opp_pct = pct_rank(p["opp_share"], opp_sorted)

            # Composite GPA
            gpa_pct = round(ppo_pct * 0.20 + cov_pct * 0.20 + sos_pct * 0.20 + ppg_pct * 0.20 + opp_pct * 0.20)
            p["gpa_pct"] = gpa_pct
            p["gpa_grade"] = grade_from_percentile(gpa_pct)

            # Stock score
            stock_score = round(ppo_pct * 0.25 + cov_pct * 0.25 + sos_pct * 0.25 + ppg_pct * 0.25)
            p["stock_score"] = stock_score

            # Stock delta (stock composite vs PPG rank — positive = undervalued)
            p["stock_delta"] = round(stock_score - ppg_pct, 1)

            # Schedule survivor score: PPG x SOS difficulty (harder schedule + high production)
            p["survivor_score"] = round(ppg_pct * 0.5 + sos_pct * 0.5, 1)

            # Breakout score: age-weighted opportunity (younger + high volume = breakout)
            age_bonus = max(0, min(30, 30 - (p["age"] - 21))) / 30 * 100  # 21yo=100, 31yo=0
            p["breakout_score"] = round(opp_pct * 0.5 + age_bonus * 0.3 + ppg_pct * 0.2, 1)

            p["efficiency_grade"] = grade_from_percentile(ppo_pct)
            p["consistency_grade"] = grade_from_percentile(cov_pct)
            p["sos_grade"] = grade_from_percentile(sos_pct)

        # Build award categories
        award_defs = [
            {
                "key": "mvp",
                "name": "MVP",
                "description": "Highest composite Fantasy GPA",
                "sort_key": "gpa_pct",
                "stat_label": "GPA",
                "stat_fn": lambda p: p["gpa_grade"],
            },
            {
                "key": "most_efficient",
                "name": "Most Efficient",
                "description": "Highest fantasy points per opportunity",
                "sort_key": "ppo",
                "stat_label": "PPO",
                "stat_fn": lambda p: str(p["ppo"]),
            },
            {
                "key": "iron_man",
                "name": "Iron Man",
                "description": "Most consistent weekly scorer",
                "sort_key": "cov",
                "stat_label": "CoV%",
                "stat_fn": lambda p: str(round(p["cov"] * 100, 1)) + "%",
                "reverse": False,
            },
            {
                "key": "schedule_survivor",
                "name": "Schedule Survivor",
                "description": "Best production despite toughest schedule",
                "sort_key": "survivor_score",
                "stat_label": "Score",
                "stat_fn": lambda p: str(p["survivor_score"]),
            },
            {
                "key": "volume_king",
                "name": "Volume King",
                "description": "Highest opportunity share on team",
                "sort_key": "opp_share",
                "stat_label": "Opp%",
                "stat_fn": lambda p: str(p["opp_share"]) + "%",
            },
            {
                "key": "breakout_star",
                "name": "Breakout Star",
                "description": "Young player with highest volume + production",
                "sort_key": "breakout_score",
                "stat_label": "Score",
                "stat_fn": lambda p: str(p["breakout_score"]),
            },
            {
                "key": "rising_stock",
                "name": "Rising Stock",
                "description": "Most undervalued — metrics exceed PPG rank",
                "sort_key": "stock_delta",
                "stat_label": "Delta",
                "stat_fn": lambda p: ("+" + str(p["stock_delta"])) if p["stock_delta"] > 0 else str(p["stock_delta"]),
            },
            {
                "key": "dominator",
                "name": "Dominator",
                "description": "Highest share of team production",
                "sort_key": "dom_rating",
                "stat_label": "Dom%",
                "stat_fn": lambda p: str(p["dom_rating"]) + "%",
            },
            {
                "key": "redzone_king",
                "name": "Red Zone King",
                "description": "Most goal-line touchdowns",
                "sort_key": "gl_tds",
                "stat_label": "GL TDs",
                "stat_fn": lambda p: str(p["gl_tds"]),
            },
            {
                "key": "best_floor",
                "name": "Best Floor",
                "description": "Highest 10th-percentile weekly score",
                "sort_key": "floor",
                "stat_label": "Floor",
                "stat_fn": lambda p: str(p["floor"]),
            },
        ]

        awards = []
        for ad in award_defs:
            reverse = ad.get("reverse", True)
            sorted_players = sorted(players, key=lambda x: x[ad["sort_key"]], reverse=reverse)
            top5 = sorted_players[:5]
            if not top5:
                continue

            stat_fn = ad["stat_fn"]

            def make_card(p, sfn=stat_fn):
                return {
                    "player_id": p["player_id"],
                    "name": p["name"],
                    "position": p["position"],
                    "team": p["team"],
                    "headshot_url": p["headshot_url"],
                    "age": p["age"],
                    "ppg": p["ppg"],
                    "games": p["games"],
                    "key_stat": sfn(p),
                    "gpa_grade": p["gpa_grade"],
                    "efficiency_grade": p["efficiency_grade"],
                    "consistency_grade": p["consistency_grade"],
                    "sos_grade": p["sos_grade"],
                    "stock_score": p["stock_score"],
                }

            awards.append({
                "key": ad["key"],
                "name": ad["name"],
                "description": ad["description"],
                "stat_label": ad["stat_label"],
                "annotation": _AWARD_ANNOTATIONS.get(ad["key"], ""),
                "winner": make_card(top5[0]),
                "runners_up": [make_card(p) for p in top5[1:]],
            })

        return {
            "season": season,
            "available_seasons": available_seasons,
            "awards": awards,
        }


# ---------------------------------------------------------------------------
# Value Over Replacement Player (VORP)
# ---------------------------------------------------------------------------

_VORP_ANNOTATIONS = {
    "QB": "QB replacement = QB12 in 12-team",
    "RB": "RB replacement = RB24 in 12-team",
    "WR": "WR replacement = WR36 in 12-team",
    "TE": "TE replacement = TE12 in 12-team",
}

_REPLACEMENT_RANKS = {"QB": 12, "RB": 24, "WR": 36, "TE": 12}


def fetch_vorp(season=None, position=None, limit=30):
    """Return VORP rankings: league winners and replacement-level players."""
    with get_db() as conn:
        # Determine season + available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        # Fetch all fantasy-relevant players (no position filter yet — need all for replacement calc)
        query = """
            SELECT
                p.player_id, p.full_name, p.position, p.team,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
            GROUP BY p.player_id
            HAVING games >= 6 AND (total_ppr / games) >= 2
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, [season]).fetchall()

        if not rows:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "replacement_thresholds": {},
                "league_winners": [],
                "replacement_level": [],
            }

        # Build player list with PPG
        all_players = []
        for r in rows:
            games = r[6] or 1
            total_ppr = r[5] or 0
            ppg = round(total_ppr / games, 2)
            all_players.append({
                "player_id": r[0],
                "full_name": r[1] or "Unknown",
                "position": r[2] or "RB",
                "team": r[3] or "FA",
                "headshot_url": r[4] or "",
                "ppg": ppg,
                "games": games,
            })

        # Compute replacement-level PPG for each position
        replacement_thresholds = {}
        for pos, repl_rank in _REPLACEMENT_RANKS.items():
            pos_players = sorted(
                [p for p in all_players if p["position"] == pos],
                key=lambda x: x["ppg"],
                reverse=True,
            )
            if len(pos_players) >= repl_rank:
                replacement_thresholds[pos] = pos_players[repl_rank - 1]["ppg"]
            elif pos_players:
                replacement_thresholds[pos] = pos_players[-1]["ppg"]
            else:
                replacement_thresholds[pos] = 0

        # Compute VORP and pos_rank for each player
        # First, compute pos_rank per position
        pos_groups = {}
        for p in all_players:
            pos_groups.setdefault(p["position"], []).append(p)
        for pos in pos_groups:
            pos_groups[pos].sort(key=lambda x: x["ppg"], reverse=True)
            for i, p in enumerate(pos_groups[pos]):
                p["pos_rank"] = i + 1

        for p in all_players:
            repl_ppg = replacement_thresholds.get(p["position"], 0)
            p["replacement_ppg"] = round(repl_ppg, 2)
            p["vorp"] = round(p["ppg"] - repl_ppg, 2)
            p["annotation"] = _VORP_ANNOTATIONS.get(p["position"], "")

        # Apply position filter if specified
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            all_players = [p for p in all_players if p["position"] == position.upper()]

        # Split into league winners (VORP > 0) and replacement level
        sorted_by_vorp = sorted(all_players, key=lambda x: x["vorp"], reverse=True)

        league_winners = [p for p in sorted_by_vorp if p["vorp"] > 0][:limit]
        # Adaptive replacement count: fewer when filtering single position
        repl_count = 10 if (position and position.upper() in ("QB", "RB", "WR", "TE")) else 25
        replacement_level = sorted(
            sorted_by_vorp[-repl_count:] if len(sorted_by_vorp) > repl_count else sorted_by_vorp,
            key=lambda x: x["vorp"],
        )[:repl_count]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "replacement_thresholds": {k: round(v, 2) for k, v in replacement_thresholds.items()},
            "league_winners": league_winners,
            "replacement_level": replacement_level,
        }
def fetch_trade_value_chart(season=None, position=None, limit=150):
    """Return all fantasy-relevant players ranked by trade value with component breakdown."""
    limit = max(1, min(300, limit))
    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else 2024

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        pos_filter = ""
        params = [season]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
              {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, params).fetchall()

        results = []
        for r in rows:
            pid = r[0]
            name = r[1] or "Unknown"
            pos = r[2] or "WR"
            team = r[3] or "FA"
            age = r[4]
            headshot = r[5] or ""
            total_ppr = r[6] or 0
            games = r[7] or 0
            ppg = round(total_ppr / games, 2) if games > 0 else 0.0

            prod_score = round(_production_value(ppg, pos), 1)
            age_score = round(_age_value(age, pos), 1)
            scarcity_score = round(_scarcity_value(pos), 1)
            tv = compute_trade_value(ppg, age, pos)
            tier = _tv_tier(tv)

            results.append({
                "player_id": pid,
                "full_name": name,
                "position": pos,
                "team": team,
                "age": age,
                "headshot_url": headshot,
                "ppg": ppg,
                "games": games,
                "trade_value": tv,
                "production_score": prod_score,
                "age_score": age_score,
                "scarcity_score": scarcity_score,
                "tier": tier,
                "tier_label": _TV_TIER_LABELS[tier],
            })

        results.sort(key=lambda x: x["trade_value"], reverse=True)
        results = results[:limit]

        for i, p in enumerate(results):
            p["rank"] = i + 1

        return {
            "season": season,
            "available_seasons": available_seasons,
            "players": results,
            "total": len(results),
        }


def fetch_trade_finder(player_id, season=None):
    """Given a player, find equal-value trade targets plus buy-low/sell-high opportunities."""
    import math
    from collections import defaultdict

    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else 2024

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        # Get all fantasy-relevant players with trade values
        rows = conn.execute("""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """, [season]).fetchall()

        if not rows:
            return {"error": "No data available", "season": season, "available_seasons": available_seasons}

        # Build player map with trade values
        all_players = []
        selected = None
        for r in rows:
            pid = r[0]
            name = r[1] or "Unknown"
            pos = r[2] or "WR"
            team = r[3] or "FA"
            age = r[4]
            headshot = r[5] or ""
            total_ppr = r[6] or 0
            games = r[7] or 0
            ppg = round(total_ppr / games, 2) if games > 0 else 0.0

            tv = compute_trade_value(ppg, age, pos)
            tier = _tv_tier(tv)
            prod_score = round(_production_value(ppg, pos), 1)
            age_score = round(_age_value(age, pos), 1)
            scarcity_score = round(_scarcity_value(pos), 1)

            p = {
                "player_id": pid,
                "full_name": name,
                "position": pos,
                "team": team,
                "age": age,
                "headshot_url": headshot,
                "ppg": ppg,
                "games": games,
                "trade_value": tv,
                "production_score": prod_score,
                "age_score": age_score,
                "scarcity_score": scarcity_score,
                "tier": tier,
                "tier_label": _TV_TIER_LABELS[tier],
            }
            all_players.append(p)
            if pid == player_id:
                selected = dict(p)

        if not selected:
            # Look up basic player info for a helpful error message
            basic = conn.execute("""
                SELECT p.player_id, p.full_name, p.position, p.team, p.headshot_url,
                       COALESCE(SUM(s.fantasy_points_ppr), 0) as total,
                       COUNT(DISTINCT s.week) as gp
                FROM players p
                LEFT JOIN player_week_stats s ON s.player_id = p.player_id AND s.season = ?
                WHERE p.player_id = ?
                GROUP BY p.player_id
            """, [season, player_id]).fetchone()
            if basic and basic[1]:
                gp = basic[6] or 0
                ppg = round(basic[5] / gp, 1) if gp > 0 else 0
                return {
                    "error": "not_enough_data",
                    "message": f"{basic[1]} doesn't qualify — needs 4+ games and 2+ PPG (has {gp} GP, {ppg} PPG)",
                    "player_name": basic[1],
                    "position": basic[2],
                    "team": basic[3],
                    "headshot_url": basic[4] or "",
                    "games": gp,
                    "ppg": ppg,
                    "season": season,
                    "available_seasons": available_seasons,
                }
            return {"error": "Player not found in database", "season": season, "available_seasons": available_seasons}

        # Compute stock scores for all players (simplified — PPO/CoV/SOS/PPG percentiles)
        weekly_rows = conn.execute("""
            SELECT s.player_id, s.fantasy_points_ppr, s.targets, s.carries
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB','RB','WR','TE')
            ORDER BY s.player_id
        """, [season]).fetchall()

        weekly_data = defaultdict(list)
        opp_data = defaultdict(lambda: {"total_ppr": 0, "opps": 0})
        for wr in weekly_rows:
            wpid, wppg, wtgt, wcar = wr[0], wr[1] or 0, wr[2] or 0, wr[3] or 0
            weekly_data[wpid].append(wppg)
            opp_data[wpid]["total_ppr"] += wppg
            opp_data[wpid]["opps"] += wtgt + wcar

        # Build PPO and CoV for stock scoring
        ppo_vals = {}
        cov_vals = {}
        ppg_vals = {}
        for p in all_players:
            pid = p["player_id"]
            weeks = weekly_data.get(pid, [])
            opps = opp_data.get(pid, {}).get("opps", 0)
            total = opp_data.get(pid, {}).get("total_ppr", 0)
            ppo = round(total / opps, 2) if opps > 0 else 0
            ppo_vals[pid] = ppo

            if len(weeks) >= 3:
                mean = sum(weeks) / len(weeks)
                variance = sum((x - mean) ** 2 for x in weeks) / max(1, len(weeks) - 1)
                std = math.sqrt(variance)
                cov = (std / mean * 100) if mean > 0 else 999
            else:
                cov = 999
            cov_vals[pid] = cov
            ppg_vals[pid] = p["ppg"]

        # Pre-sort for efficient percentile ranking
        from bisect import bisect_left, bisect_right
        ppo_sorted = sorted(ppo_vals.values())
        cov_sorted = sorted(cov_vals.values())  # ascending — lower CoV is better
        ppg_sorted = sorted(ppg_vals.values())
        n_players = len(all_players)

        def pct_rank(sorted_asc, value, total):
            """Percentile: fraction of values below this value."""
            if total == 0:
                return 50
            return round(bisect_left(sorted_asc, value) / total * 100)

        def pct_rank_inv(sorted_asc, value, total):
            """Inverted percentile: fraction of values above this value (lower = better)."""
            if total == 0:
                return 50
            above = total - bisect_right(sorted_asc, value)
            return round(above / total * 100)

        # Assign stock data to all players
        player_map = {}
        for p in all_players:
            pid = p["player_id"]
            ppo_pct = pct_rank(ppo_sorted, ppo_vals.get(pid, 0), n_players)
            cov_pct = pct_rank_inv(cov_sorted, cov_vals.get(pid, 999), n_players)
            ppg_pct = pct_rank(ppg_sorted, ppg_vals.get(pid, 0), n_players)
            # Stock score: 3-factor simplified model (excludes SOS to avoid heavy
            # defense grid query). Stock watch uses 4-factor with SOS at 25% each.
            # Here we weight PPO/CoV/PPG at ~33% each — directionally similar.
            stock_score = round(ppo_pct * 0.33 + cov_pct * 0.33 + ppg_pct * 0.34)
            stock_delta = stock_score - round(ppg_pct)
            p["stock_score"] = stock_score
            p["stock_delta"] = stock_delta
            if stock_delta > 5:
                p["stock_trend"] = "rising"
            elif stock_delta < -5:
                p["stock_trend"] = "falling"
            else:
                p["stock_trend"] = "stable"
            player_map[pid] = p

        sel_tv = selected["trade_value"]
        selected_full = player_map.get(player_id, selected)

        # Find targets
        VALUE_RANGE = 8  # +/- points for equal value
        equal_targets = []
        buy_low = []
        sell_high = []

        for p in all_players:
            if p["player_id"] == player_id:
                continue
            diff = round(p["trade_value"] - sel_tv, 1)
            p_copy = dict(p)
            p_copy["value_diff"] = diff

            # Equal value: within +/- VALUE_RANGE
            is_equal = abs(diff) <= VALUE_RANGE
            if is_equal:
                equal_targets.append(p_copy)

            # Buy low: higher trade value but falling stock — exclude equal-value dupes
            if not is_equal and diff > 0 and diff <= 15 and p.get("stock_trend") == "falling":
                buy_low.append(p_copy)

            # Sell high: lower trade value but rising stock — exclude equal-value dupes
            if not is_equal and diff < 0 and diff >= -15 and p.get("stock_trend") == "rising":
                sell_high.append(p_copy)

        # Sort
        equal_targets.sort(key=lambda x: abs(x["value_diff"]))
        buy_low.sort(key=lambda x: x["stock_delta"])  # most negative delta first
        sell_high.sort(key=lambda x: x["stock_delta"], reverse=True)  # most positive delta first

        return {
            "season": season,
            "available_seasons": available_seasons,
            "selected_player": selected_full,
            "equal_targets": equal_targets[:25],
            "buy_low": buy_low[:15],
            "sell_high": sell_high[:15],
        }


# ---------------------------------------------------------------------------
# Roster Builder — Grade a hypothetical dynasty roster
# ---------------------------------------------------------------------------

def fetch_roster_grade(player_ids, season=None):
    """Grade a set of player IDs as a dynasty roster.

    Returns overall grade (A+ to F), dimension scores, and per-player details.
    Dimensions: trade_value (avg), vorp (avg), age_balance, positional_depth.
    """
    if not player_ids:
        return {"error": "No players provided", "overall_grade": "F", "overall_score": 0}

    # Cap at 25 roster slots
    player_ids = list(player_ids)[:25]

    with get_db() as conn:
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        latest_season = season or (row[0] if row and row[0] else 2024)

        placeholders = ",".join(["?"] * len(player_ids))
        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            LEFT JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.player_id IN ({placeholders})
            GROUP BY p.player_id
        """
        params = [latest_season] + player_ids
        rows = conn.execute(query, params).fetchall()

        if not rows:
            return {"error": "No players found", "overall_grade": "F", "overall_score": 0}

        # Build player details
        players = []
        for r in rows:
            games = r[7] or 0
            total_ppr = r[6] or 0
            ppg = round(total_ppr / games, 2) if games > 0 else 0.0
            pos = r[2] or "WR"
            age = r[4] or 25
            tv = compute_trade_value(ppg, age, pos)

            # Compute VORP using standard thresholds
            repl_ppg = {
                "QB": 14.5, "RB": 8.0, "WR": 8.5, "TE": 7.0
            }.get(pos, 8.0)
            vorp = round(ppg - repl_ppg, 2)

            players.append({
                "player_id": r[0],
                "full_name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "age": age,
                "headshot_url": r[5] or "",
                "ppg": ppg,
                "games": games,
                "trade_value": tv,
                "vorp": vorp,
            })

        # --- Dimension 1: Trade Value (avg of all players, scaled to 0-100) ---
        avg_tv = sum(p["trade_value"] for p in players) / len(players)
        # Good rosters avg ~45-55 trade value; scale so 50 = 75 score
        tv_score = min(100, max(0, avg_tv * 1.5))

        # --- Dimension 2: VORP (sum, more positive = better) ---
        total_vorp = sum(p["vorp"] for p in players)
        # Good rosters have ~30-60 total VORP; scale
        vorp_score = min(100, max(0, 50 + total_vorp * 1.2))

        # --- Dimension 3: Age Balance (penalize all-old or all-young) ---
        ages = [p["age"] for p in players if p["age"]]
        if ages:
            avg_age = sum(ages) / len(ages)
            # Ideal avg age is ~25-26 for dynasty
            age_dev = abs(avg_age - 25.5)
            age_score = max(0, 100 - age_dev * 12)
            # Bonus for age diversity (std dev)
            if len(ages) > 1:
                age_std = math.sqrt(sum((a - avg_age) ** 2 for a in ages) / len(ages))
                # Some diversity is good (std ~3-4), too much or too little is bad
                diversity_bonus = max(0, 15 - abs(age_std - 3.5) * 5)
                age_score = min(100, age_score + diversity_bonus)
        else:
            age_score = 50

        # --- Dimension 4: Positional Depth ---
        pos_counts = {}
        for p in players:
            pos_counts[p["position"]] = pos_counts.get(p["position"], 0) + 1

        # Ideal dynasty roster: 1-2 QB, 5-7 RB, 6-8 WR, 2-3 TE
        ideal = {"QB": 2, "RB": 6, "WR": 7, "TE": 2}
        depth_score = 100
        for pos, ideal_count in ideal.items():
            actual = pos_counts.get(pos, 0)
            diff = abs(actual - ideal_count)
            depth_score -= diff * 8  # -8 per player off from ideal
        # Penalize missing positions heavily
        for pos in ("QB", "RB", "WR", "TE"):
            if pos_counts.get(pos, 0) == 0:
                depth_score -= 15
        depth_score = max(0, min(100, depth_score))

        # --- Overall Score (weighted) ---
        overall_score = round(
            tv_score * 0.35 + vorp_score * 0.25 + age_score * 0.20 + depth_score * 0.20
        )
        overall_score = max(0, min(100, overall_score))

        # Grade mapping
        grade_thresholds = [
            (95, "A+"), (90, "A"), (85, "A-"),
            (80, "B+"), (75, "B"), (70, "B-"),
            (65, "C+"), (60, "C"), (55, "C-"),
            (50, "D+"), (45, "D"), (40, "D-"),
        ]
        overall_grade = "F"
        for threshold, grade in grade_thresholds:
            if overall_score >= threshold:
                overall_grade = grade
                break

        # Position summary
        position_summary = {}
        for pos in ("QB", "RB", "WR", "TE"):
            pos_players = [p for p in players if p["position"] == pos]
            position_summary[pos] = {
                "count": len(pos_players),
                "avg_trade_value": round(sum(p["trade_value"] for p in pos_players) / len(pos_players), 1) if pos_players else 0,
                "total_vorp": round(sum(p["vorp"] for p in pos_players), 1),
            }

        total_trade_value = round(sum(p["trade_value"] for p in players), 1)

        return {
            "overall_grade": overall_grade,
            "overall_score": overall_score,
            "total_trade_value": total_trade_value,
            "player_count": len(players),
            "dimensions": {
                "trade_value": round(tv_score, 1),
                "vorp": round(vorp_score, 1),
                "age_balance": round(age_score, 1),
                "positional_depth": round(depth_score, 1),
            },
            "position_summary": position_summary,
            "players": sorted(players, key=lambda x: x["trade_value"], reverse=True),
        }


# ---------------------------------------------------------------------------
# Scoring Format Comparison — PPR vs Half-PPR vs Standard
# ---------------------------------------------------------------------------

def fetch_scoring_comparison(season=None, position=None, limit=40):
    """Compare player rankings across PPR, Half-PPR, and Standard scoring."""
    with get_db() as conn:
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        pos_filter = ""
        params = [season]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                SUM(s.fantasy_points_half_ppr) as total_half,
                SUM(s.receptions) as total_rec,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
              {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 6 AND (total_ppr / games) >= 2
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, params).fetchall()

        if not rows:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "risers": [],
                "fallers": [],
            }

        # Build player list — standard = PPR - receptions (consistent with cheat sheet)
        players = []
        for r in rows:
            games = r[8] or 1
            total_ppr = r[5] or 0
            total_half = r[6] or 0
            total_rec = r[7] or 0
            total_std = total_ppr - total_rec
            players.append({
                "player_id": r[0],
                "full_name": r[1] or "Unknown",
                "position": r[2] or "WR",
                "team": r[3] or "FA",
                "headshot_url": r[4] or "",
                "ppg_ppr": round(total_ppr / games, 2),
                "ppg_half": round(total_half / games, 2),
                "ppg_std": round(total_std / games, 2),
                "games": games,
            })

        # Compute ranks for each format
        by_ppr = sorted(players, key=lambda x: x["ppg_ppr"], reverse=True)
        by_half = sorted(players, key=lambda x: x["ppg_half"], reverse=True)
        by_std = sorted(players, key=lambda x: x["ppg_std"], reverse=True)

        ppr_ranks = {p["player_id"]: i + 1 for i, p in enumerate(by_ppr)}
        half_ranks = {p["player_id"]: i + 1 for i, p in enumerate(by_half)}
        std_ranks = {p["player_id"]: i + 1 for i, p in enumerate(by_std)}

        for p in players:
            pid = p["player_id"]
            p["rank_ppr"] = ppr_ranks[pid]
            p["rank_half"] = half_ranks[pid]
            p["rank_std"] = std_ranks[pid]
            # Positive rank_diff = player ranks HIGHER (better) in PPR than STD
            p["rank_diff"] = std_ranks[pid] - ppr_ranks[pid]

        # Split into risers (rank_diff > 0, helped by PPR) and fallers (rank_diff < 0, hurt by PPR)
        risers = sorted(
            [p for p in players if p["rank_diff"] > 0],
            key=lambda x: x["rank_diff"],
            reverse=True,
        )[:limit]

        fallers = sorted(
            [p for p in players if p["rank_diff"] < 0],
            key=lambda x: x["rank_diff"],
        )[:limit]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "risers": risers,
            "fallers": fallers,
        }


# ---------------------------------------------------------------------------
# Fantasy Draft Cheat Sheet
# ---------------------------------------------------------------------------

_CHEAT_TIERS = [
    (20.0, "Elite"),
    (15.0, "Starter"),
    (10.0, "Flex"),
    (5.0, "Bench"),
    (0.0, "Stash"),
]


def fetch_cheat_sheet(season=None, fmt="ppr"):
    """Return a printable draft cheat sheet grouped by position with tier breaks."""
    with get_db() as conn:
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        # Select the right fantasy points column
        pts_col = {
            "ppr": "fantasy_points_ppr",
            "half": "fantasy_points_half_ppr",
            "std": "fantasy_points_ppr",  # fallback; compute std below
        }.get(fmt, "fantasy_points_ppr")

        use_std_calc = (fmt == "std")

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                SUM(s.{pts_col}) as total_pts,
                SUM(s.receptions) as total_rec,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_pts / games) >= 2
            ORDER BY total_pts DESC
        """
        rows = conn.execute(query, [season]).fetchall()

        if not rows:
            return {"season": season, "available_seasons": available_seasons, "format": fmt, "positions": {}}

        # Build per-position lists
        positions = {"QB": [], "RB": [], "WR": [], "TE": []}
        for r in rows:
            pos = r[2] or "WR"
            if pos not in positions:
                continue
            games = r[7] or 1
            total_pts = r[5] or 0
            total_rec = r[6] or 0

            # Standard = PPR points - receptions (1 point per rec in PPR)
            if use_std_calc:
                total_pts = total_pts - total_rec

            ppg = round(total_pts / games, 2)
            age = r[4] or 25
            tv = compute_trade_value(ppg, age, pos)

            # Assign tier
            tier = "Stash"
            for threshold, label in _CHEAT_TIERS:
                if ppg >= threshold:
                    tier = label
                    break

            positions[pos].append({
                "player_id": r[0],
                "full_name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "age": age,
                "ppg": ppg,
                "trade_value": tv,
                "tier": tier,
            })

        # Sort each position by PPG desc, limit to top 40, assign ranks
        for pos in positions:
            positions[pos].sort(key=lambda x: x["ppg"], reverse=True)
            positions[pos] = positions[pos][:40]
            for i, p in enumerate(positions[pos]):
                p["rank"] = i + 1

        return {
            "season": season,
            "available_seasons": available_seasons,
            "format": fmt,
            "positions": positions,
        }


# ---------------------------------------------------------------------------
# Auction Value Calculator
# ---------------------------------------------------------------------------

def fetch_auction_values(season=None, budget=200, roster_size=15):
    """Convert trade values into auction dollar amounts for a given budget and roster size."""
    budget = max(50, min(500, budget))
    roster_size = max(8, min(25, roster_size))
    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else 2024

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        query = """
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, [season]).fetchall()

        players = []
        for r in rows:
            pid = r[0]
            name = r[1] or "Unknown"
            pos = r[2] or "WR"
            team = r[3] or "FA"
            age = r[4]
            headshot = r[5] or ""
            total_ppr = r[6] or 0
            games = r[7] or 1
            ppg = round(total_ppr / games, 2)
            tv = compute_trade_value(ppg, age, pos)

            players.append({
                "player_id": pid,
                "full_name": name,
                "position": pos,
                "team": team,
                "age": age,
                "headshot_url": headshot,
                "ppg": ppg,
                "games": games,
                "trade_value": tv,
            })

        players.sort(key=lambda x: x["trade_value"], reverse=True)

        # Convert trade values to auction dollars
        # Top roster_size players should sum to approximately budget
        reserve = roster_size  # $1 per roster spot minimum
        allocatable = max(1, budget - reserve)
        # Use top N players' TV as denominator so a team's picks sum to budget
        top_n_tv = sum(p["trade_value"] for p in players[:roster_size]) or 1.0

        for i, p in enumerate(players):
            p["rank"] = i + 1
            # Dollar value = proportional share of allocatable budget
            raw_dollars = (p["trade_value"] / top_n_tv) * allocatable
            # Cap at budget, floor at $1
            p["auction_value"] = max(1, min(budget, round(raw_dollars)))
            # Value tier
            if p["auction_value"] >= 40:
                p["tier"] = "premium"
            elif p["auction_value"] >= 20:
                p["tier"] = "starter"
            elif p["auction_value"] >= 10:
                p["tier"] = "value"
            elif p["auction_value"] >= 5:
                p["tier"] = "bargain"
            else:
                p["tier"] = "dollar"

        # Position group summaries
        pos_totals = {}
        for pos in ("QB", "RB", "WR", "TE"):
            pos_players = [p for p in players if p["position"] == pos]
            pos_totals[pos] = {
                "count": len(pos_players),
                "total_value": sum(p["auction_value"] for p in pos_players),
                "avg_value": round(sum(p["auction_value"] for p in pos_players) / len(pos_players), 1) if pos_players else 0,
                "top_value": pos_players[0]["auction_value"] if pos_players else 0,
            }

        return {
            "season": season,
            "available_seasons": available_seasons,
            "budget": budget,
            "roster_size": roster_size,
            "players": players[:200],
            "position_totals": pos_totals,
        }


# ---------------------------------------------------------------------------
# Dynasty Dashboard — At-a-Glance Overview
# ---------------------------------------------------------------------------

def fetch_dynasty_dashboard(season=None):
    """Aggregated dynasty dashboard: risers, fallers, value picks, scarcity alerts."""
    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else 2024

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        # Get all fantasy-relevant players with stats
        query = """
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, [season]).fetchall()

        # Build player list with all metrics
        players = []
        for r in rows:
            pos = r[2] or "WR"
            games = r[7] or 1
            ppg = round((r[6] or 0) / games, 2)
            age = r[4] or 25
            tv = compute_trade_value(ppg, age, pos)

            players.append({
                "player_id": r[0],
                "full_name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "age": age,
                "headshot_url": r[5] or "",
                "ppg": ppg,
                "games": games,
                "trade_value": tv,
            })

        # Rank by PPG and trade value
        players.sort(key=lambda x: x["ppg"], reverse=True)
        for i, p in enumerate(players):
            p["ppg_rank"] = i + 1

        players.sort(key=lambda x: x["trade_value"], reverse=True)
        for i, p in enumerate(players):
            p["tv_rank"] = i + 1
            p["rank_diff"] = p["ppg_rank"] - p["tv_rank"]

        # Risers: trade value much higher than PPG rank (undervalued by production age/scarcity boost)
        risers = sorted(
            [p for p in players if p["rank_diff"] > 5],
            key=lambda x: x["rank_diff"], reverse=True
        )[:8]

        # Fallers: PPG rank much higher than trade value rank (overvalued)
        fallers = sorted(
            [p for p in players if p["rank_diff"] < -5],
            key=lambda x: x["rank_diff"]
        )[:8]

        # Value picks: high trade value, young, good PPG
        value_picks = sorted(
            [p for p in players if p["age"] <= 26 and p["ppg"] >= 10 and p["trade_value"] >= 40],
            key=lambda x: x["trade_value"], reverse=True
        )[:8]

        # Position scarcity: top player PPG by position and drop-off
        pos_scarcity = {}
        for pos in ("QB", "RB", "WR", "TE"):
            pos_players = sorted(
                [p for p in players if p["position"] == pos],
                key=lambda x: x["ppg"], reverse=True
            )
            if len(pos_players) >= 2:
                top_ppg = pos_players[0]["ppg"]
                mid_idx = min(11, len(pos_players) - 1)
                mid_ppg = pos_players[mid_idx]["ppg"]
                drop = round(top_ppg - mid_ppg, 1)
                pos_scarcity[pos] = {
                    "top_player": pos_players[0]["full_name"],
                    "top_ppg": top_ppg,
                    "mid_player": pos_players[mid_idx]["full_name"],
                    "mid_ppg": mid_ppg,
                    "dropoff": drop,
                    "count": len(pos_players),
                }

        # League trends: avg age, avg PPG by position
        trends = {}
        for pos in ("QB", "RB", "WR", "TE"):
            pos_p = [p for p in players if p["position"] == pos]
            if pos_p:
                trends[pos] = {
                    "count": len(pos_p),
                    "avg_ppg": round(sum(p["ppg"] for p in pos_p) / len(pos_p), 1),
                    "avg_age": round(sum(p["age"] for p in pos_p) / len(pos_p), 1),
                    "avg_tv": round(sum(p["trade_value"] for p in pos_p) / len(pos_p), 1),
                }

        # Top 5 overall
        top5 = sorted(players, key=lambda x: x["trade_value"], reverse=True)[:5]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "total_players": len(players),
            "top5": top5,
            "risers": risers,
            "fallers": fallers,
            "value_picks": value_picks,
            "position_scarcity": pos_scarcity,
            "trends": trends,
        }


# ---------------------------------------------------------------------------
# Dynasty Tier List
# ---------------------------------------------------------------------------

_TIER_BREAKS = [
    (80, "S", "Elite — untouchable dynasty cornerstones"),
    (65, "A", "Blue Chip — premium assets with staying power"),
    (50, "B", "Solid — reliable starters with upside"),
    (35, "C", "Flex — startable but replaceable"),
    (20, "D", "Depth — roster filler with some value"),
    (0, "F", "Cut Bait — minimal dynasty value"),
]

def fetch_tier_list(season=None, position=None):
    """Return players grouped into S/A/B/C/D/F tiers by trade value."""
    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else 2024

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        pos_filter = ""
        params = [season]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
              {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, params).fetchall()

        tiers = {t[1]: {"tier": t[1], "label": t[2], "min_tv": t[0], "players": []} for t in _TIER_BREAKS}
        tier_order = [t[1] for t in _TIER_BREAKS]

        for r in rows:
            pos = r[2] or "WR"
            games = r[7] or 1
            ppg = round((r[6] or 0) / games, 2)
            age = r[4] or 25
            tv = compute_trade_value(ppg, age, pos)

            tier_key = "F"
            for threshold, key, _ in _TIER_BREAKS:
                if tv >= threshold:
                    tier_key = key
                    break

            tiers[tier_key]["players"].append({
                "player_id": r[0],
                "full_name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "age": age,
                "headshot_url": r[5] or "",
                "ppg": ppg,
                "trade_value": tv,
            })

        for t in tier_order:
            tiers[t]["players"].sort(key=lambda x: x["trade_value"], reverse=True)
            for i, p in enumerate(tiers[t]["players"]):
                p["tier_rank"] = i + 1

        result_tiers = [tiers[t] for t in tier_order]
        total = sum(len(t["players"]) for t in result_tiers)

        return {
            "season": season,
            "available_seasons": available_seasons,
            "position": position or "ALL",
            "total_players": total,
            "tiers": result_tiers,
        }


# ---------------------------------------------------------------------------
# Player Archetypes — Statistical Cluster Analysis
# ---------------------------------------------------------------------------

# Position-specific archetype definitions with stat-based classification
_RB_ARCHETYPES = [
    {"id": "workhorse", "name": "Workhorse", "desc": "High-volume bell-cow backs who dominate touches",
     "test": lambda s: s.get("carries_g", 0) >= 14 and s.get("ppg", 0) >= 12},
    {"id": "pass_catcher", "name": "Pass-Catching Back", "desc": "Receiving-focused RBs who thrive in PPR",
     "test": lambda s: s.get("targets_g", 0) >= 4 and s.get("rec_g", 0) >= 3},
    {"id": "efficient", "name": "Efficient Runner", "desc": "High yards-per-carry backs who maximize opportunities",
     "test": lambda s: s.get("ypc", 0) >= 4.8 and s.get("carries_g", 0) >= 8},
    {"id": "td_vulture", "name": "TD Vulture", "desc": "Goal-line specialists who convert near the end zone",
     "test": lambda s: s.get("td_rate", 0) >= 0.05 and s.get("ppg", 0) >= 8},
    {"id": "committee", "name": "Other RB", "desc": "Backs who don't fit a single archetype cleanly",
     "test": lambda s: True},
]

_WR_ARCHETYPES = [
    {"id": "alpha", "name": "Alpha Target", "desc": "High-volume primary receivers who dominate targets",
     "test": lambda s: s.get("targets_g", 0) >= 8 and s.get("ppg", 0) >= 14},
    {"id": "deep_threat", "name": "Deep Threat", "desc": "Big-play specialists with high yards per reception",
     "test": lambda s: s.get("ypr", 0) >= 14 and s.get("rec_yd_g", 0) >= 50},
    {"id": "possession", "name": "Possession Receiver", "desc": "High-catch-rate chain movers with reliable hands",
     "test": lambda s: s.get("catch_rate", 0) >= 0.70 and s.get("rec_g", 0) >= 4},
    {"id": "yac_monster", "name": "YAC Monster", "desc": "Receivers who create after the catch",
     "test": lambda s: s.get("yac_g", 0) >= 25 and s.get("rec_g", 0) >= 3},
    {"id": "role_player", "name": "Other WR", "desc": "Receivers who don't fit a single archetype cleanly",
     "test": lambda s: True},
]

_TE_ARCHETYPES = [
    {"id": "elite_receiver", "name": "Elite Receiving TE", "desc": "Top-tier pass-catching tight ends",
     "test": lambda s: s.get("targets_g", 0) >= 6 and s.get("ppg", 0) >= 10},
    {"id": "red_zone", "name": "Red Zone Weapon", "desc": "TDs come in bunches for these big targets",
     "test": lambda s: s.get("td_rate", 0) >= 0.06 and s.get("rec_g", 0) >= 2},
    {"id": "reliable", "name": "Reliable Target", "desc": "Consistent catches with a safe floor",
     "test": lambda s: s.get("catch_rate", 0) >= 0.68 and s.get("rec_g", 0) >= 3},
    {"id": "blocking_te", "name": "Other TE", "desc": "Tight ends who don't fit a single archetype cleanly",
     "test": lambda s: True},
]

_QB_ARCHETYPES = [
    {"id": "elite_dual", "name": "Elite Dual-Threat", "desc": "Top passers who also hurt you with their legs",
     "test": lambda s: s.get("ppg", 0) >= 20 and s.get("rush_yd_g", 0) >= 20},
    {"id": "gunslinger", "name": "Gunslinger", "desc": "Pure pocket passers with volume and touchdowns",
     "test": lambda s: s.get("pass_yd_g", 0) >= 250 and s.get("ppg", 0) >= 18},
    {"id": "game_manager", "name": "Game Manager", "desc": "Efficient passers who limit turnovers",
     "test": lambda s: s.get("ppg", 0) >= 14 and s.get("pass_yd_g", 0) >= 200},
    {"id": "rusher", "name": "Rushing QB", "desc": "Legs-first quarterbacks with rushing upside",
     "test": lambda s: s.get("rush_yd_g", 0) >= 25},
    {"id": "backup", "name": "Backup/Streamer", "desc": "Serviceable starters with streaming appeal",
     "test": lambda s: True},
]


def fetch_player_archetypes(season=None, position=None):
    """Classify players into statistical archetypes based on per-game stats."""
    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else 2024

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        pos_filter = ""
        params = [season]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                p.headshot_url,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games,
                SUM(s.receptions) as total_rec,
                SUM(s.targets) as total_tgt,
                SUM(s.receiving_yards) as total_rec_yd,
                SUM(s.receiving_tds) as total_rec_td,
                SUM(s.carries) as total_car,
                SUM(s.rushing_yards) as total_rush_yd,
                SUM(s.rushing_tds) as total_rush_td,
                SUM(s.passing_yards) as total_pass_yd,
                SUM(s.passing_tds) as total_pass_td,
                SUM(s.receiving_yards_after_catch) as total_yac
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
              {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, params).fetchall()

        # Build per-game stats for classification
        players_by_pos = {"QB": [], "RB": [], "WR": [], "TE": []}
        for r in rows:
            pos = r[2] or "WR"
            if pos not in players_by_pos:
                continue
            g = r[7] or 1
            total_touches = (r[12] or 0) + (r[8] or 0)
            total_tds = (r[11] or 0) + (r[14] or 0)
            stats = {
                "ppg": round((r[6] or 0) / g, 2),
                "rec_g": round((r[8] or 0) / g, 2),
                "targets_g": round((r[9] or 0) / g, 2),
                "rec_yd_g": round((r[10] or 0) / g, 2),
                "carries_g": round((r[12] or 0) / g, 2),
                "rush_yd_g": round((r[13] or 0) / g, 2),
                "pass_yd_g": round((r[15] or 0) / g, 2),
                "ypc": round((r[13] or 0) / max(1, r[12] or 1), 2),
                "ypr": round((r[10] or 0) / max(1, r[8] or 1), 2),
                "catch_rate": round((r[8] or 0) / max(1, r[9] or 1), 3),
                "td_rate": round(total_tds / max(1, total_touches), 4),
                "yac_g": round((r[17] or 0) / g, 2),
            }

            players_by_pos[pos].append({
                "player_id": r[0],
                "full_name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "age": r[4] or 25,
                "headshot_url": r[5] or "",
                "ppg": stats["ppg"],
                "games": g,
                "stats": stats,
            })

        # Classify players into archetypes
        archetype_map = {"QB": _QB_ARCHETYPES, "RB": _RB_ARCHETYPES, "WR": _WR_ARCHETYPES, "TE": _TE_ARCHETYPES}
        result_archetypes = []

        positions_to_process = [position.upper()] if position and position.upper() in archetype_map else ["QB", "RB", "WR", "TE"]

        for pos in positions_to_process:
            archetypes = archetype_map[pos]
            classified = {a["id"]: [] for a in archetypes}
            assigned = set()

            for arch in archetypes:
                for p in players_by_pos.get(pos, []):
                    if p["player_id"] in assigned:
                        continue
                    if arch["test"](p["stats"]):
                        player_out = {k: v for k, v in p.items() if k != "stats"}
                        # Add key stat for display
                        if pos == "QB":
                            player_out["key_stat"] = str(round(p["stats"]["pass_yd_g"])) + " pass yd/g"
                        elif pos == "RB":
                            player_out["key_stat"] = str(round(p["stats"]["carries_g"], 1)) + " car/g"
                        elif pos == "WR":
                            player_out["key_stat"] = str(round(p["stats"]["targets_g"], 1)) + " tgt/g"
                        elif pos == "TE":
                            player_out["key_stat"] = str(round(p["stats"]["targets_g"], 1)) + " tgt/g"
                        classified[arch["id"]].append(player_out)
                        assigned.add(p["player_id"])

            for arch in archetypes:
                if classified[arch["id"]]:
                    result_archetypes.append({
                        "id": arch["id"],
                        "name": arch["name"],
                        "desc": arch["desc"],
                        "position": pos,
                        "count": len(classified[arch["id"]]),
                        "players": classified[arch["id"]],
                    })

        total = sum(a["count"] for a in result_archetypes)

        return {
            "season": season,
            "available_seasons": available_seasons,
            "position": position or "ALL",
            "total_players": total,
            "archetypes": result_archetypes,
        }
def fetch_draft_class(draft_year=None, position=None):
    """Return fantasy production stats for players from a given draft class."""
    with get_db() as conn:
        available_classes = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM draft_picks WHERE season >= 2020 ORDER BY season DESC"
            ).fetchall()
        ]

        if not draft_year:
            # Default to most recent class with stats data
            draft_year = available_classes[0] if available_classes else 2024

        pos_filter = ""
        params = [draft_year]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND d.position = ?"
            params.append(position.upper())

        query = f"""
            SELECT
                d.player_name, d.position, d.round, d.pick, d.team as draft_team,
                d.college,
                p.player_id, p.team as current_team, p.age,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.season) as seasons_played,
                COUNT(DISTINCT s.week) as total_games
            FROM draft_picks d
            LEFT JOIN players p ON p.position = d.position
                AND (LOWER(p.full_name) = LOWER(d.player_name)
                     OR LOWER(REPLACE(REPLACE(REPLACE(p.full_name, ' Jr.', ''), ' III', ''), ' II', ''))
                        = LOWER(REPLACE(REPLACE(REPLACE(d.player_name, ' Jr.', ''), ' III', ''), ' II', '')))
            LEFT JOIN player_week_stats s ON s.player_id = p.player_id
            WHERE d.season = ?
              AND d.position IN ('QB', 'RB', 'WR', 'TE')
              {pos_filter}
            GROUP BY d.player_name, d.position, d.round, d.pick
            ORDER BY total_ppr DESC
        """
        rows = conn.execute(query, params).fetchall()

        players = []
        round_totals = {}  # round -> {ppr, count, games}

        for r in rows:
            total_ppr = r[9] or 0
            games = r[11] or 0
            ppg = round(total_ppr / games, 2) if games > 0 else 0
            rnd = r[2] or 0

            player = {
                "name": r[0] or "Unknown",
                "position": r[1] or "",
                "round": rnd,
                "pick": r[3] or 0,
                "draft_team": r[4] or "",
                "college": r[5] or "",
                "player_id": r[6] or "",
                "current_team": r[7] or r[4] or "",
                "age": r[8] or 0,
                "total_ppr": round(total_ppr, 1),
                "seasons_played": r[10] or 0,
                "games": games,
                "ppg": ppg,
            }

            # Hit/bust classification
            if games == 0:
                player["verdict"] = "no_data"
            elif ppg >= 15:
                player["verdict"] = "hit"
            elif ppg >= 10:
                player["verdict"] = "solid"
            elif ppg >= 5:
                player["verdict"] = "ok"
            else:
                player["verdict"] = "bust"

            players.append(player)

            if rnd not in round_totals:
                round_totals[rnd] = {"ppr": 0, "count": 0, "games": 0}
            round_totals[rnd]["ppr"] += total_ppr
            round_totals[rnd]["count"] += 1
            round_totals[rnd]["games"] += games

        # Round summary
        rounds = []
        for rnd in sorted(round_totals.keys()):
            rt = round_totals[rnd]
            rounds.append({
                "round": rnd,
                "players": rt["count"],
                "total_ppr": round(rt["ppr"], 1),
                "avg_ppg": round(rt["ppr"] / rt["games"], 2) if rt["games"] > 0 else 0,
                "total_games": rt["games"],
            })

        # Class summary
        total_ppr_all = sum(p["total_ppr"] for p in players)
        total_games_all = sum(p["games"] for p in players)
        hits = sum(1 for p in players if p["verdict"] == "hit")
        busts = sum(1 for p in players if p["verdict"] == "bust")

        summary = {
            "draft_year": draft_year,
            "total_players": len(players),
            "total_ppr": round(total_ppr_all, 1),
            "avg_ppg": round(total_ppr_all / total_games_all, 2) if total_games_all > 0 else 0,
            "hits": hits,
            "busts": busts,
            "hit_rate": round(hits / len(players) * 100, 1) if players else 0,
        }

        return {
            "draft_year": draft_year,
            "available_classes": available_classes,
            "position": position or "ALL",
            "summary": summary,
            "rounds": rounds,
            "players": players,
        }
def fetch_td_regression(season=None, position=None, limit=30):
    """Return players whose TD rate deviates most from position average."""
    with get_db() as conn:
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        pos_filter = ""
        params = [season]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games,
                SUM(s.targets) as targets,
                SUM(s.carries) as carries,
                SUM(s.receptions) as receptions,
                SUM(s.receiving_tds) as rec_tds,
                SUM(s.rushing_tds) as rush_tds,
                SUM(s.passing_tds) as pass_tds,
                SUM(s.attempts) as pass_att,
                SUM(s.touchdowns) as total_tds,
                SUM(s.receiving_yards) as rec_yd,
                SUM(s.rushing_yards) as rush_yd
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
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
                "regression_up": [],
                "regression_down": [],
            }

        # Build player list and compute position-level TD rates
        players = []
        pos_opp_totals = {}  # position -> {opps: int, tds: int}

        for r in rows:
            pos = r[2] or "RB"
            targets = r[6] or 0
            carries = r[7] or 0
            rec_tds = r[9] or 0
            rush_tds = r[10] or 0
            pass_tds = r[11] or 0
            pass_att = r[12] or 0
            total_tds = r[13] or 0
            games = r[5] or 1

            # Opportunities depend on position
            if pos == "QB":
                opps = pass_att + carries
                tds = pass_tds + rush_tds
            elif pos == "RB":
                opps = carries + targets
                tds = rush_tds + rec_tds
            else:  # WR, TE
                opps = targets + carries
                tds = rec_tds + rush_tds

            # Need meaningful opportunity sample
            if opps < 40:
                continue

            td_rate = tds / opps if opps > 0 else 0
            ppg = round((r[4] or 0) / games, 2)

            # Accumulate position totals for average
            if pos not in pos_opp_totals:
                pos_opp_totals[pos] = {"opps": 0, "tds": 0}
            pos_opp_totals[pos]["opps"] += opps
            pos_opp_totals[pos]["tds"] += tds

            players.append({
                "player_id": r[0],
                "name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "games": games,
                "ppg": ppg,
                "opportunities": opps,
                "actual_tds": tds,
                "td_rate": round(td_rate * 100, 2),
                "rec_yd": r[14] or 0,
                "rush_yd": r[15] or 0,
            })

        # Compute position-average TD rate
        pos_avg_rates = {}
        for pos, totals in pos_opp_totals.items():
            pos_avg_rates[pos] = totals["tds"] / totals["opps"] if totals["opps"] > 0 else 0

        # Compute expected TDs and regression delta for each player
        for p in players:
            pos = p["position"]
            avg_rate = pos_avg_rates.get(pos, 0)
            expected_tds = round(p["opportunities"] * avg_rate, 1)
            delta = round(expected_tds - p["actual_tds"], 1)
            p["pos_avg_td_rate"] = round(avg_rate * 100, 2)
            p["expected_tds"] = expected_tds
            p["regression_delta"] = delta  # positive = due for more TDs

        # Sort by regression delta
        regression_up = sorted(
            [p for p in players if p["regression_delta"] > 0],
            key=lambda x: x["regression_delta"],
            reverse=True,
        )[:limit]

        regression_down = sorted(
            [p for p in players if p["regression_delta"] < 0],
            key=lambda x: x["regression_delta"],
        )[:limit]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "pos_avg_rates": {k: round(v * 100, 2) for k, v in pos_avg_rates.items()},
            "regression_up": regression_up,
            "regression_down": regression_down,
        }
def fetch_weekly_leaders(season=None, week=None, position=None, limit=25):
    """Return top fantasy performers for a given week."""
    with get_db() as conn:
        # Available seasons
        row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        # Available weeks for this season
        wk_rows = conn.execute(
            "SELECT DISTINCT week FROM player_week_stats WHERE season = ? ORDER BY week",
            (season,)
        ).fetchall()
        available_weeks = [r[0] for r in wk_rows] if wk_rows else list(range(1, 19))
        if not week:
            week = available_weeks[-1] if available_weeks else 1

        pos_filter = ""
        params = [season, week]
        if position and position.upper() in ("QB", "RB", "WR", "TE"):
            pos_filter = "AND p.position = ?"
            params.append(position.upper())

        query = f"""
            SELECT
                p.player_id, p.full_name, p.position, p.team,
                s.fantasy_points_ppr,
                s.passing_yards, s.passing_tds, s.interceptions,
                s.rushing_yards, s.rushing_tds, s.carries,
                s.receiving_yards, s.receiving_tds, s.receptions, s.targets
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ? AND s.week = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              {pos_filter}
            ORDER BY s.fantasy_points_ppr DESC
            LIMIT ?
        """
        params.append(limit)
        rows = conn.execute(query, params).fetchall()

        leaders = []
        for i, r in enumerate(rows):
            pos = r[2] or "RB"
            fpts = r[4] or 0
            leaders.append({
                "rank": i + 1,
                "player_id": r[0],
                "name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "fantasy_points": round(fpts, 1),
                "pass_yd": r[5] or 0,
                "pass_td": r[6] or 0,
                "ints": r[7] or 0,
                "rush_yd": r[8] or 0,
                "rush_td": r[9] or 0,
                "carries": r[10] or 0,
                "rec_yd": r[11] or 0,
                "rec_td": r[12] or 0,
                "rec": r[13] or 0,
                "tgt": r[14] or 0,
            })

        return {
            "season": season,
            "week": week,
            "available_seasons": available_seasons,
            "available_weeks": available_weeks,
            "leaders": leaders,
        }


def fetch_pace_tracker(season=None, position=None, limit=50):
    """Project per-game stats to 17-game season and track milestone progress."""
    with get_db() as conn:
        cursor = conn.cursor()

        if not season:
            cursor.execute("SELECT MAX(season) FROM player_week_stats")
            season = cursor.fetchone()[0] or 2024

        query = """
            SELECT p.player_id, p.full_name, p.position, p.team,
                   COUNT(DISTINCT s.week) as games,
                   COALESCE(SUM(s.pass_yards), 0) as total_pass_yd,
                   COALESCE(SUM(s.pass_td), 0) as total_pass_td,
                   COALESCE(SUM(s.rush_yards), 0) as total_rush_yd,
                   COALESCE(SUM(s.rush_td), 0) as total_rush_td,
                   COALESCE(SUM(s.rec_yards), 0) as total_rec_yd,
                   COALESCE(SUM(s.rec_td), 0) as total_rec_td,
                   COALESCE(SUM(s.receptions), 0) as total_rec,
                   COALESCE(SUM(s.targets), 0) as total_tgt,
                   COALESCE(SUM(s.carries), 0) as total_car,
                   COALESCE(SUM(s.fantasy_points_ppr), 0) as total_fpts
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.fantasy_relevant = 1
        """
        params = [season]

        if position:
            query += " AND p.position = ?"
            params.append(position)

        query += " GROUP BY p.player_id HAVING games >= 3 ORDER BY total_fpts DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query, params)
        rows = cursor.fetchall()

        total_weeks = 17

        milestones_def = {
            "QB": [
                {"label": "4,000 Pass Yd", "stat": "pass_yd", "target": 4000},
                {"label": "4,500 Pass Yd", "stat": "pass_yd", "target": 4500},
                {"label": "30 Pass TD", "stat": "pass_td", "target": 30},
                {"label": "40 Pass TD", "stat": "pass_td", "target": 40},
                {"label": "500 Rush Yd", "stat": "rush_yd", "target": 500},
            ],
            "RB": [
                {"label": "1,000 Rush Yd", "stat": "rush_yd", "target": 1000},
                {"label": "1,500 Rush Yd", "stat": "rush_yd", "target": 1500},
                {"label": "10 Rush TD", "stat": "rush_td", "target": 10},
                {"label": "50 Rec", "stat": "rec", "target": 50},
                {"label": "500 Rec Yd", "stat": "rec_yd", "target": 500},
            ],
            "WR": [
                {"label": "1,000 Rec Yd", "stat": "rec_yd", "target": 1000},
                {"label": "1,500 Rec Yd", "stat": "rec_yd", "target": 1500},
                {"label": "100 Rec", "stat": "rec", "target": 100},
                {"label": "10 Rec TD", "stat": "rec_td", "target": 10},
                {"label": "150 Tgt", "stat": "tgt", "target": 150},
            ],
            "TE": [
                {"label": "800 Rec Yd", "stat": "rec_yd", "target": 800},
                {"label": "1,000 Rec Yd", "stat": "rec_yd", "target": 1000},
                {"label": "70 Rec", "stat": "rec", "target": 70},
                {"label": "8 Rec TD", "stat": "rec_td", "target": 8},
                {"label": "100 Tgt", "stat": "tgt", "target": 100},
            ],
        }

        stat_idx_map = {
            "pass_yd": 5, "pass_td": 6, "rush_yd": 7, "rush_td": 8,
            "rec_yd": 9, "rec_td": 10, "rec": 11, "tgt": 12, "car": 13,
        }

        players = []
        for r in rows:
            pid = r[0]
            pos = r[2] or "RB"
            games = r[4]
            games_remaining = max(0, total_weeks - games)

            ppg_fpts = round(r[14] / games, 1) if games else 0
            ppg_pass_yd = round(r[5] / games, 1) if games else 0
            ppg_pass_td = round(r[6] / games, 1) if games else 0
            ppg_rush_yd = round(r[7] / games, 1) if games else 0
            ppg_rush_td = round(r[8] / games, 1) if games else 0
            ppg_rec_yd = round(r[9] / games, 1) if games else 0
            ppg_rec_td = round(r[10] / games, 1) if games else 0
            ppg_rec = round(r[11] / games, 1) if games else 0

            proj_pass_yd = round(ppg_pass_yd * total_weeks)
            proj_pass_td = round(ppg_pass_td * total_weeks, 1)
            proj_rush_yd = round(ppg_rush_yd * total_weeks)
            proj_rush_td = round(ppg_rush_td * total_weeks, 1)
            proj_rec_yd = round(ppg_rec_yd * total_weeks)
            proj_rec_td = round(ppg_rec_td * total_weeks, 1)
            proj_rec = round(ppg_rec * total_weeks, 1)
            proj_fpts = round(ppg_fpts * total_weeks, 1)

            pos_milestones = milestones_def.get(pos, milestones_def.get("WR", []))
            tracked = []
            for ms in pos_milestones:
                stat_key = ms["stat"]
                idx = stat_idx_map.get(stat_key, 5)
                current = r[idx] or 0
                target = ms["target"]
                remaining = max(0, target - current)
                per_game_avg = round(current / games, 1) if games else 0
                projected = round(per_game_avg * total_weeks, 1)
                pace_needed = round(remaining / games_remaining, 1) if games_remaining > 0 else 0
                on_pace = projected >= target

                tracked.append({
                    "label": ms["label"],
                    "target": target,
                    "current": round(current, 1),
                    "projected": projected,
                    "remaining": round(remaining, 1),
                    "pace_needed": pace_needed,
                    "per_game_avg": per_game_avg,
                    "on_pace": on_pace,
                    "pct": round(min(100, (current / target) * 100), 1) if target else 0,
                })

            players.append({
                "player_id": pid,
                "name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "games": games,
                "games_remaining": games_remaining,
                "ppg": ppg_fpts,
                "proj_fpts": proj_fpts,
                "proj_pass_yd": proj_pass_yd,
                "proj_pass_td": proj_pass_td,
                "proj_rush_yd": proj_rush_yd,
                "proj_rush_td": proj_rush_td,
                "proj_rec_yd": proj_rec_yd,
                "proj_rec_td": proj_rec_td,
                "proj_rec": proj_rec,
                "milestones": tracked,
            })

        return {
            "season": season,
            "total_weeks": total_weeks,
            "players": players,
        }
def fetch_streaks(season=None, position=None, window=4, limit=25):
    """Identify players on hot or cold scoring streaks vs their season average."""
    with get_db() as conn:
        cursor = conn.cursor()

        if not season:
            cursor.execute("SELECT MAX(season) FROM player_week_stats")
            season = cursor.fetchone()[0] or 2024

        window = max(2, min(8, window))

        # Get all weekly scores for qualifying players
        query = """
            SELECT p.player_id, p.full_name, p.position, p.team,
                   s.week, COALESCE(s.fantasy_points_ppr, 0) as fpts
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.fantasy_relevant = 1
        """
        params = [season]
        if position:
            query += " AND p.position = ?"
            params.append(position)
        query += " ORDER BY p.player_id, s.week ASC"

        cursor.execute(query, params)
        rows = cursor.fetchall()

        # Group by player
        from collections import defaultdict
        player_weeks = defaultdict(list)
        player_info = {}
        for r in rows:
            pid = r[0]
            if pid not in player_info:
                player_info[pid] = {"name": r[1] or "Unknown", "position": r[2] or "RB", "team": r[3] or "FA"}
            player_weeks[pid].append({"week": r[4], "fpts": round(r[5], 1)})

        hot = []
        cold = []

        for pid, weeks in player_weeks.items():
            if len(weeks) < window + 2:
                continue

            total_fpts = sum(w["fpts"] for w in weeks)
            season_avg = total_fpts / len(weeks)
            if season_avg < 2:
                continue

            recent = weeks[-window:]
            recent_avg = sum(w["fpts"] for w in recent) / len(recent)
            delta = recent_avg - season_avg
            delta_pct = round((delta / season_avg) * 100, 1) if season_avg else 0

            entry = {
                "player_id": pid,
                "name": player_info[pid]["name"],
                "position": player_info[pid]["position"],
                "team": player_info[pid]["team"],
                "games": len(weeks),
                "season_avg": round(season_avg, 1),
                "recent_avg": round(recent_avg, 1),
                "delta": round(delta, 1),
                "delta_pct": delta_pct,
                "recent_scores": [w["fpts"] for w in recent],
            }

            if delta >= 2:
                hot.append(entry)
            elif delta <= -2:
                cold.append(entry)

        hot.sort(key=lambda x: x["delta"], reverse=True)
        cold.sort(key=lambda x: x["delta"])

        return {
            "season": season,
            "window": window,
            "hot": hot[:limit],
            "cold": cold[:limit],
        }


def fetch_season_recap(season=None):
    """Generate a data-driven season recap with key storylines."""
    with get_db() as conn:
        cursor = conn.cursor()

        if not season:
            cursor.execute("SELECT MAX(season) FROM player_week_stats")
            season = cursor.fetchone()[0] or 2024

        # Available seasons
        cursor.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC")
        available_seasons = [r[0] for r in cursor.fetchall()]

        # Season totals for qualifying players
        cursor.execute("""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   COUNT(DISTINCT s.week) as games,
                   COALESCE(SUM(s.fantasy_points_ppr), 0) as total_fpts
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
            GROUP BY p.player_id
            HAVING games >= 6
            ORDER BY total_fpts DESC
        """, (season,))
        season_rows = cursor.fetchall()

        def player_dict(r, rank=None):
            d = {
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "RB", "team": r[3] or "FA",
                "games": r[4], "total_fpts": round(r[5], 1),
                "ppg": round(r[5] / r[4], 1) if r[4] else 0,
            }
            if rank is not None:
                d["rank"] = rank
            return d

        # 1. Overall #1
        overall_1 = player_dict(season_rows[0], 1) if season_rows else None

        # 2. Top per position
        pos_leaders = {}
        for r in season_rows:
            pos = r[2] or "RB"
            if pos not in pos_leaders:
                pos_leaders[pos] = player_dict(r, 1)

        # 3. Highest single game
        cursor.execute("""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   s.week, s.fantasy_points_ppr
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
            ORDER BY s.fantasy_points_ppr DESC
            LIMIT 5
        """, (season,))
        top_weeks = []
        for r in cursor.fetchall():
            top_weeks.append({
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "RB", "team": r[3] or "FA",
                "week": r[4], "fpts": round(r[5] or 0, 1),
            })

        # 4. Most consistent (lowest CoV, min 8 games, min 5 PPG)
        from collections import defaultdict
        player_weeks = defaultdict(list)
        for r in season_rows:
            pid = r[0]
            player_weeks[pid] = {"info": r, "scores": []}

        cursor.execute("""
            SELECT player_id, fantasy_points_ppr
            FROM player_week_stats
            WHERE season = ?
            ORDER BY player_id, week
        """, (season,))
        for r in cursor.fetchall():
            if r[0] in player_weeks:
                player_weeks[r[0]]["scores"].append(r[1] or 0)

        import math
        consistent = []
        volatile = []
        for pid, data in player_weeks.items():
            scores = data["scores"]
            info = data["info"]
            if len(scores) < 8:
                continue
            avg = sum(scores) / len(scores)
            if avg < 5:
                continue
            variance = sum((s - avg) ** 2 for s in scores) / max(1, len(scores) - 1)
            std = math.sqrt(variance)
            cov = (std / avg) * 100 if avg else 999

            entry = player_dict(info)
            entry["cov"] = round(cov, 1)
            entry["std"] = round(std, 1)
            consistent.append(entry)
            volatile.append(entry)

        consistent.sort(key=lambda x: x["cov"])
        volatile.sort(key=lambda x: x["cov"], reverse=True)

        # 5. Biggest breakout (YoY PPG increase, prev season exists)
        prev_season = season - 1
        cursor.execute("""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   COUNT(DISTINCT s.week) as games,
                   COALESCE(SUM(s.fantasy_points_ppr), 0) as total_fpts
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
            GROUP BY p.player_id
            HAVING games >= 6
        """, (prev_season,))
        prev_data = {}
        for r in cursor.fetchall():
            prev_data[r[0]] = round(r[5] / r[4], 1) if r[4] else 0

        breakouts = []
        busts = []
        for r in season_rows:
            pid = r[0]
            if pid not in prev_data:
                continue
            curr_ppg = round(r[5] / r[4], 1) if r[4] else 0
            prev_ppg = prev_data[pid]
            if prev_ppg < 3:
                continue
            delta = round(curr_ppg - prev_ppg, 1)
            pct = round((delta / prev_ppg) * 100, 1) if prev_ppg else 0
            entry = player_dict(r)
            entry["prev_ppg"] = prev_ppg
            entry["delta"] = delta
            entry["delta_pct"] = pct
            if delta >= 3:
                breakouts.append(entry)
            elif delta <= -3:
                busts.append(entry)

        breakouts.sort(key=lambda x: x["delta"], reverse=True)
        busts.sort(key=lambda x: x["delta"])

        # 6. Season stats summary
        total_players = len(season_rows)
        avg_ppg = round(sum(r[5] / r[4] for r in season_rows if r[4]) / total_players, 1) if total_players else 0

        return {
            "season": season,
            "available_seasons": available_seasons,
            "overall_1": overall_1,
            "pos_leaders": pos_leaders,
            "top_weeks": top_weeks[:5],
            "most_consistent": consistent[:5],
            "most_volatile": volatile[:5],
            "breakouts": breakouts[:5],
            "busts": busts[:5],
            "total_players": total_players,
            "avg_ppg": avg_ppg,
        }
def fetch_records(position=None, limit=10):
    """Return all-time fantasy records: single-game, single-season, career PPG."""
    with get_db() as conn:
        cursor = conn.cursor()

        pos_filter = ""
        params_base = []
        if position:
            pos_filter = " AND p.position = ?"
            params_base = [position]

        # 1. Single-game records (highest PPR score in one week)
        cursor.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   s.season, s.week, s.fantasy_points_ppr
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE p.fantasy_relevant = 1 {pos_filter}
            ORDER BY s.fantasy_points_ppr DESC
            LIMIT ?
        """, params_base + [limit])
        single_game = []
        for r in cursor.fetchall():
            single_game.append({
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "RB", "team": r[3] or "FA",
                "season": r[4], "week": r[5],
                "fpts": round(r[6] or 0, 1),
            })

        # 2. Single-season records (highest total PPR in one season)
        cursor.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   s.season, COUNT(DISTINCT s.week) as games,
                   SUM(s.fantasy_points_ppr) as total_fpts
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE p.fantasy_relevant = 1 {pos_filter}
            GROUP BY p.player_id, s.season
            HAVING games >= 6
            ORDER BY total_fpts DESC
            LIMIT ?
        """, params_base + [limit])
        single_season = []
        for r in cursor.fetchall():
            games = r[5] or 1
            total = r[6] or 0
            single_season.append({
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "RB", "team": r[3] or "FA",
                "season": r[4], "games": games,
                "total_fpts": round(total, 1),
                "ppg": round(total / games, 1),
            })

        # 3. Career PPG leaders (across all seasons, min 20 games)
        cursor.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   COUNT(DISTINCT s.week || '-' || s.season) as games,
                   SUM(s.fantasy_points_ppr) as total_fpts,
                   MIN(s.season) as first_season,
                   MAX(s.season) as last_season
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE p.fantasy_relevant = 1 {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 20
            ORDER BY (total_fpts * 1.0 / games) DESC
            LIMIT ?
        """, params_base + [limit])
        career_ppg = []
        for r in cursor.fetchall():
            games = r[4] or 1
            total = r[5] or 0
            career_ppg.append({
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "RB", "team": r[3] or "FA",
                "games": games, "total_fpts": round(total, 1),
                "ppg": round(total / games, 1),
                "seasons": f"{r[6]}-{r[7]}",
            })

        # 4. Most total career points
        cursor.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   COUNT(DISTINCT s.week || '-' || s.season) as games,
                   SUM(s.fantasy_points_ppr) as total_fpts
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE p.fantasy_relevant = 1 {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 20
            ORDER BY total_fpts DESC
            LIMIT ?
        """, params_base + [limit])
        career_total = []
        for r in cursor.fetchall():
            games = r[4] or 1
            total = r[5] or 0
            career_total.append({
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "RB", "team": r[3] or "FA",
                "games": games, "total_fpts": round(total, 1),
                "ppg": round(total / games, 1),
            })

        return {
            "single_game": single_game,
            "single_season": single_season,
            "career_ppg": career_ppg,
            "career_total": career_total,
        }


def fetch_waivers(season=None, position=None, window=4, limit=30):
    """
    Waiver wire targets — players with high recent PPG but low season PPG.
    These are likely unrostered players who have been producing recently.
    Compares recent window PPG vs full season PPG; big positive delta = waiver target.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # Determine season
        if not season:
            cursor.execute("SELECT MAX(season) FROM player_week_stats")
            season = cursor.fetchone()[0] or 2024

        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        # Get all weekly scores for eligible players this season
        cursor.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   s.week, s.fantasy_points_ppr
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
              AND s.fantasy_points_ppr IS NOT NULL
              {pos_filter}
            ORDER BY p.player_id, s.week
        """, params)

        from collections import defaultdict
        player_weeks = defaultdict(list)
        player_info = {}
        for r in cursor.fetchall():
            pid = r[0]
            player_weeks[pid].append({"week": r[4], "fpts": r[5] or 0})
            if pid not in player_info:
                player_info[pid] = {
                    "player_id": pid,
                    "name": r[1] or "Unknown",
                    "position": r[2] or "RB",
                    "team": r[3] or "FA",
                }

        targets = []
        for pid, weeks in player_weeks.items():
            if len(weeks) < window + 2:
                continue

            # Sort by week descending to get recent games
            weeks.sort(key=lambda w: w["week"], reverse=True)
            recent = weeks[:window]
            all_scores = [w["fpts"] for w in weeks]

            season_avg = sum(all_scores) / len(all_scores) if all_scores else 0
            recent_avg = sum(w["fpts"] for w in recent) / len(recent) if recent else 0
            delta = recent_avg - season_avg

            # Only include players who are surging (recent >> season)
            # and whose season avg is low (likely unrostered)
            if delta < 2 or season_avg > 14:
                continue

            delta_pct = (delta / season_avg * 100) if season_avg > 0.5 else 0

            info = player_info[pid]
            recent_scores = [w["fpts"] for w in reversed(recent)]
            targets.append({
                "player_id": info["player_id"],
                "name": info["name"],
                "position": info["position"],
                "team": info["team"],
                "season_avg": round(season_avg, 1),
                "recent_avg": round(recent_avg, 1),
                "delta": round(delta, 1),
                "delta_pct": round(delta_pct, 0),
                "games": len(all_scores),
                "recent_scores": [round(s, 1) for s in recent_scores],
            })

        # Sort by delta descending (biggest surge first)
        targets.sort(key=lambda x: x["delta"], reverse=True)
        targets = targets[:limit]

        return {
            "targets": targets,
            "season": season,
            "window": window,
            "count": len(targets),
        }


def fetch_playoff_schedule(season=None, position=None, limit=40):
    """
    Playoff schedule planner — grades each player's playoff matchups (weeks 14-17).
    Uses defense PPG-allowed-by-position to rate each week's difficulty.
    Returns players ranked by playoff SOS (easiest first = best playoff schedule).
    """
    with get_db() as conn:
        cursor = conn.cursor()

        if not season:
            cursor.execute("SELECT MAX(season) FROM player_week_stats")
            season = cursor.fetchone()[0] or 2024

        # Build defense PPG-allowed-by-position for the season
        cursor.execute("""
            SELECT s.opponent_team, p.position,
                   COALESCE(SUM(s.fantasy_points_ppr), 0) as total_ppr,
                   COUNT(DISTINCT s.week) as games
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
            GROUP BY s.opponent_team, p.position
        """, [season])

        defense_ppg = {}
        for r in cursor.fetchall():
            team, pos, total, games = r[0], r[1], r[2], r[3]
            if games <= 0:
                continue
            if team not in defense_ppg:
                defense_ppg[team] = {}
            defense_ppg[team][pos] = round(total / games, 2)

        # League avg per position
        league_avg = {}
        for pos in ("QB", "RB", "WR", "TE"):
            vals = [defense_ppg[t][pos] for t in defense_ppg if pos in defense_ppg.get(t, {})]
            league_avg[pos] = sum(vals) / len(vals) if vals else 0

        # Get player playoff week data (weeks 14-17)
        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        cursor.execute(f"""
            SELECT s.player_id, p.full_name, p.position, p.team,
                   s.opponent_team, s.fantasy_points_ppr, s.week
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ?
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND p.fantasy_relevant = 1
              AND s.week BETWEEN 14 AND 17
              AND s.opponent_team IS NOT NULL AND s.opponent_team != ''
              {pos_filter}
            ORDER BY s.player_id, s.week
        """, params)

        from collections import defaultdict
        players = defaultdict(lambda: {"weeks": [], "name": "", "position": "", "team": ""})

        for r in cursor.fetchall():
            pid = r[0]
            players[pid]["name"] = r[1] or "Unknown"
            players[pid]["position"] = r[2] or "RB"
            players[pid]["team"] = r[3] or "FA"
            players[pid]["weeks"].append({
                "week": r[6],
                "opponent": r[4],
                "fpts": round(r[5] or 0, 1),
            })

        results = []
        for pid, info in players.items():
            if len(info["weeks"]) < 2:
                continue

            pos = info["position"]
            la = league_avg.get(pos, 0)

            week_details = []
            opp_ppg_total = 0
            for w in sorted(info["weeks"], key=lambda x: x["week"]):
                opp = w["opponent"]
                opp_ppg = defense_ppg.get(opp, {}).get(pos, la)
                diff = opp_ppg - la
                # Positive diff = defense allows more = easier matchup
                if diff > 3:
                    grade = "A"
                elif diff > 1:
                    grade = "B"
                elif diff > -1:
                    grade = "C"
                elif diff > -3:
                    grade = "D"
                else:
                    grade = "F"

                week_details.append({
                    "week": w["week"],
                    "opponent": opp,
                    "fpts": w["fpts"],
                    "opp_ppg": round(opp_ppg, 1),
                    "diff": round(diff, 1),
                    "grade": grade,
                })
                opp_ppg_total += opp_ppg

            avg_opp_ppg = opp_ppg_total / len(week_details) if week_details else 0
            playoff_ppg = sum(w["fpts"] for w in week_details) / len(week_details) if week_details else 0
            overall_diff = avg_opp_ppg - la

            if overall_diff > 3:
                sos_grade = "A+"
            elif overall_diff > 2:
                sos_grade = "A"
            elif overall_diff > 1:
                sos_grade = "B+"
            elif overall_diff > 0:
                sos_grade = "B"
            elif overall_diff > -1:
                sos_grade = "C"
            elif overall_diff > -2:
                sos_grade = "D"
            else:
                sos_grade = "F"

            results.append({
                "player_id": pid,
                "name": info["name"],
                "position": pos,
                "team": info["team"],
                "weeks": week_details,
                "playoff_ppg": round(playoff_ppg, 1),
                "avg_opp_ppg": round(avg_opp_ppg, 1),
                "sos_diff": round(overall_diff, 1),
                "sos_grade": sos_grade,
                "games": len(week_details),
            })

        # Sort by avg_opp_ppg descending (easiest playoff schedule first)
        results.sort(key=lambda x: x["avg_opp_ppg"], reverse=True)
        results = results[:limit]

        return {
            "players": results,
            "season": season,
            "count": len(results),
        }


def fetch_fpts_breakdown(season=None, position=None, limit=40):
    """
    Fantasy points breakdown — how each player accumulates their PPR points.
    Breaks down total PPR into: rush yards, rec yards, pass yards, receptions, TDs.
    PPR scoring: 0.04 per pass yd, 0.1 per rush/rec yd, 1 per reception,
                 4 per pass TD, 6 per rush/rec TD, -2 per INT.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        if not season:
            cursor.execute("SELECT MAX(season) FROM player_week_stats")
            season = cursor.fetchone()[0] or 2024

        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        cursor.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   SUM(s.passing_yards) as pass_yd,
                   SUM(s.rushing_yards) as rush_yd,
                   SUM(s.receiving_yards) as rec_yd,
                   SUM(s.receptions) as rec,
                   SUM(s.passing_tds) as pass_td,
                   SUM(s.rushing_tds) as rush_td,
                   SUM(s.receiving_tds) as rec_td,
                   SUM(s.interceptions) as ints,
                   SUM(s.fantasy_points_ppr) as total_ppr,
                   COUNT(DISTINCT s.week) as games
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 4 AND total_ppr > 20
            ORDER BY total_ppr DESC
            LIMIT ?
        """, params + [limit])

        players = []
        for r in cursor.fetchall():
            pass_yd = r[4] or 0
            rush_yd = r[5] or 0
            rec_yd = r[6] or 0
            rec = r[7] or 0
            pass_td = r[8] or 0
            rush_td = r[9] or 0
            rec_td = r[10] or 0
            ints = r[11] or 0
            total_ppr = r[12] or 0
            games = r[13] or 1

            # PPR component breakdown
            pass_yd_pts = pass_yd * 0.04
            rush_yd_pts = rush_yd * 0.1
            rec_yd_pts = rec_yd * 0.1
            rec_pts = rec * 1.0
            td_pts = pass_td * 4 + (rush_td + rec_td) * 6
            int_pts = ints * -2

            # Calculate percentages of total (excluding negative INT)
            positive_total = pass_yd_pts + rush_yd_pts + rec_yd_pts + rec_pts + td_pts
            if positive_total <= 0:
                continue

            players.append({
                "player_id": r[0],
                "name": r[1] or "Unknown",
                "position": r[2] or "RB",
                "team": r[3] or "FA",
                "games": games,
                "total_ppr": round(total_ppr, 1),
                "ppg": round(total_ppr / games, 1),
                "pass_yd_pts": round(pass_yd_pts, 1),
                "rush_yd_pts": round(rush_yd_pts, 1),
                "rec_yd_pts": round(rec_yd_pts, 1),
                "rec_pts": round(rec_pts, 1),
                "td_pts": round(td_pts, 1),
                "int_pts": round(int_pts, 1),
                "pass_yd_pct": round(pass_yd_pts / positive_total * 100, 0),
                "rush_yd_pct": round(rush_yd_pts / positive_total * 100, 0),
                "rec_yd_pct": round(rec_yd_pts / positive_total * 100, 0),
                "rec_pct": round(rec_pts / positive_total * 100, 0),
                "td_pct": round(td_pts / positive_total * 100, 0),
            })

        return {
            "players": players,
            "season": season,
            "count": len(players),
        }


def fetch_garbage_time(season=None, position=None, limit=40):
    """Garbage time detector — identifies stat padders with high garbage-time scoring %."""
    with get_db() as conn:
        cursor = conn.cursor()
        if not season:
            cursor.execute("SELECT MAX(season) FROM player_season_stats")
            season = cursor.fetchone()[0] or 2025

        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        cursor.execute(f"""
            SELECT p.gsis_id, p.full_name, p.position, p.team,
                   s.games,
                   s.passing_yards, s.passing_tds, s.interceptions,
                   s.rushing_yards, s.rushing_tds,
                   s.receiving_yards, s.receiving_tds, s.receptions,
                   pbp.garbage_time_pct, pbp.avg_score_differential
            FROM player_season_stats s
            JOIN players p ON p.gsis_id = s.player_id
            LEFT JOIN player_season_pbp pbp ON pbp.player_id = s.player_id AND pbp.season = s.season
            WHERE s.season = ? AND p.fantasy_relevant = 1
            {pos_filter}
            AND s.games >= 4
        """, params)

        players = []
        for r in cursor.fetchall():
            pid, name, pos, team = r[0], r[1] or "Unknown", r[2] or "RB", r[3] or "FA"
            games = r[4] or 1
            pass_yd = r[5] or 0
            pass_td = r[6] or 0
            ints = r[7] or 0
            rush_yd = r[8] or 0
            rush_td = r[9] or 0
            rec_yd = r[10] or 0
            rec_td = r[11] or 0
            recs = r[12] or 0
            gt_pct = r[13]
            avg_diff = r[14]

            if gt_pct is None:
                continue

            ppr = (pass_yd * 0.04 + pass_td * 4 - ints * 2 +
                   rush_yd * 0.1 + rush_td * 6 +
                   rec_yd * 0.1 + rec_td * 6 + recs * 1)
            ppg = ppr / games

            players.append({
                "player_id": pid,
                "name": name,
                "position": pos,
                "team": team,
                "games": games,
                "ppg": round(ppg, 1),
                "garbage_time_pct": round(gt_pct, 1),
                "avg_score_diff": round(avg_diff, 1) if avg_diff is not None else 0,
            })

        # Split into stat padders (high GT%) and clean producers (low GT%)
        stat_padders = sorted([p for p in players if p["garbage_time_pct"] >= 15],
                              key=lambda x: x["garbage_time_pct"], reverse=True)[:limit]
        clean_producers = sorted([p for p in players if p["garbage_time_pct"] <= 5 and p["ppg"] >= 8],
                                 key=lambda x: x["ppg"], reverse=True)[:limit]

        return {
            "stat_padders": stat_padders,
            "clean_producers": clean_producers,
            "season": season,
        }


def fetch_snap_efficiency(season=None, position=None, limit=50):
    """Snap efficiency — fantasy points per snap played."""
    with get_db() as conn:
        cursor = conn.cursor()
        if not season:
            cursor.execute("SELECT MAX(season) FROM player_season_stats")
            season = cursor.fetchone()[0] or 2025

        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        cursor.execute(f"""
            SELECT p.gsis_id, p.full_name, p.position, p.team,
                   s.offense_snaps, s.games,
                   s.passing_yards, s.passing_tds, s.interceptions,
                   s.rushing_yards, s.rushing_tds,
                   s.receiving_yards, s.receiving_tds, s.receptions
            FROM player_season_stats s
            JOIN players p ON p.gsis_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
            {pos_filter}
            AND s.games >= 4
            AND s.offense_snaps >= 50
        """, params)

        players = []
        for r in cursor.fetchall():
            pid, name, pos, team = r[0], r[1] or "Unknown", r[2] or "RB", r[3] or "FA"
            snaps = r[4] or 0
            games = r[5] or 1
            pass_yd = r[6] or 0
            pass_td = r[7] or 0
            ints = r[8] or 0
            rush_yd = r[9] or 0
            rush_td = r[10] or 0
            rec_yd = r[11] or 0
            rec_td = r[12] or 0
            recs = r[13] or 0

            # PPR scoring
            ppr = (pass_yd * 0.04 + pass_td * 4 - ints * 2 +
                   rush_yd * 0.1 + rush_td * 6 +
                   rec_yd * 0.1 + rec_td * 6 + recs * 1)

            ppg = ppr / games
            snaps_pg = snaps / games
            pts_per_snap = ppr / snaps if snaps > 0 else 0

            players.append({
                "player_id": pid,
                "name": name,
                "position": pos,
                "team": team,
                "games": games,
                "total_ppr": round(ppr, 1),
                "ppg": round(ppg, 1),
                "snaps": snaps,
                "snaps_pg": round(snaps_pg, 1),
                "pts_per_snap": round(pts_per_snap, 2),
            })

        players.sort(key=lambda x: x["pts_per_snap"], reverse=True)
        players = players[:limit]

        return {
            "players": players,
            "season": season,
            "count": len(players),
        }


def fetch_handcuffs(season=None, limit=30):
    """
    Handcuff rankings — backup RBs ranked by value.
    For each team, find the #1 RB (most carries) and #2 RB (handcuff).
    Rank handcuffs by team rushing volume and their own efficiency/usage.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        if not season:
            cursor.execute("SELECT MAX(season) FROM player_week_stats")
            season = cursor.fetchone()[0] or 2024

        cursor.execute("""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   SUM(s.carries) as total_car,
                   SUM(s.rushing_yards) as total_rush_yd,
                   SUM(s.rushing_tds) as total_rush_td,
                   SUM(s.targets) as total_tgt,
                   SUM(s.receptions) as total_rec,
                   SUM(s.fantasy_points_ppr) as total_ppr,
                   COUNT(DISTINCT s.week) as games
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
              AND p.position = 'RB'
            GROUP BY p.player_id
            HAVING games >= 3 AND total_car >= 10
            ORDER BY p.team, total_car DESC
        """, [season])

        from collections import defaultdict
        team_rbs = defaultdict(list)
        for r in cursor.fetchall():
            team_rbs[r[3] or "FA"].append({
                "player_id": r[0],
                "name": r[1] or "Unknown",
                "team": r[3] or "FA",
                "carries": r[4] or 0,
                "rush_yd": r[5] or 0,
                "rush_td": r[6] or 0,
                "targets": r[7] or 0,
                "receptions": r[8] or 0,
                "total_ppr": round(r[9] or 0, 1),
                "games": r[10] or 1,
            })

        handcuffs = []
        for team, rbs in team_rbs.items():
            if len(rbs) < 2:
                continue
            rbs.sort(key=lambda x: x["carries"], reverse=True)
            starter = rbs[0]
            hc = rbs[1]

            team_rush_per_game = (starter["carries"] + hc["carries"]) / max(starter["games"], hc["games"], 1)
            starter_car_per_game = starter["carries"] / max(starter["games"], 1)
            hc_car_per_game = hc["carries"] / max(hc["games"], 1)
            hc_ppg = hc["total_ppr"] / max(hc["games"], 1)
            hc_ypc = hc["rush_yd"] / max(hc["carries"], 1)

            hc_value = round(team_rush_per_game * (hc_ppg / max(starter_car_per_game, 1)) * 10, 1)

            handcuffs.append({
                "team": team,
                "starter_name": starter["name"],
                "starter_id": starter["player_id"],
                "starter_car_g": round(starter_car_per_game, 1),
                "starter_ppg": round(starter["total_ppr"] / max(starter["games"], 1), 1),
                "handcuff_name": hc["name"],
                "handcuff_id": hc["player_id"],
                "hc_car_g": round(hc_car_per_game, 1),
                "hc_ppg": round(hc_ppg, 1),
                "hc_ypc": round(hc_ypc, 1),
                "hc_games": hc["games"],
                "hc_targets": hc["targets"],
                "hc_receptions": hc["receptions"],
                "team_rush_g": round(team_rush_per_game, 1),
                "hc_value": hc_value,
            })

        handcuffs.sort(key=lambda x: x["hc_value"], reverse=True)
        handcuffs = handcuffs[:limit]

        return {
            "handcuffs": handcuffs,
            "season": season,
            "count": len(handcuffs),
        }


def fetch_weekly_mvp(season=None):
    """
    Weekly MVP grid — the #1 PPR scorer at each position for every week.
    Returns a grid: {weeks: [{week, QB: {name, fpts}, RB: ..., WR: ..., TE: ...}]}
    """
    with get_db() as conn:
        cursor = conn.cursor()

        if not season:
            cursor.execute("SELECT MAX(season) FROM player_week_stats")
            season = cursor.fetchone()[0] or 2024

        cursor.execute("""
            SELECT s.week, p.position, p.full_name, p.team,
                   s.fantasy_points_ppr, p.player_id
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              AND s.fantasy_points_ppr IS NOT NULL
            ORDER BY s.week, p.position, s.fantasy_points_ppr DESC
        """, [season])

        from collections import defaultdict
        # Group by week+position, keep top scorer
        week_pos = defaultdict(lambda: defaultdict(lambda: None))
        for r in cursor.fetchall():
            week, pos = r[0], r[1]
            if week_pos[week][pos] is None:
                week_pos[week][pos] = {
                    "name": r[2] or "Unknown",
                    "team": r[3] or "FA",
                    "fpts": round(r[4] or 0, 1),
                    "player_id": r[5],
                }

        weeks = []
        for wk in sorted(week_pos.keys()):
            entry = {"week": wk}
            for pos in ("QB", "RB", "WR", "TE"):
                entry[pos] = week_pos[wk].get(pos) or {"name": "-", "team": "", "fpts": 0}
            weeks.append(entry)

        return {
            "weeks": weeks,
            "season": season,
            "total_weeks": len(weeks),
        }


def fetch_stacks(season=None, limit=30):
    """
    Stack correlation finder — QB + WR/TE same-team scoring correlations.
    Computes Pearson correlation between QB weekly scores and their pass
    catchers' weekly scores (same team). Best stacks = highest correlation.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        if not season:
            cursor.execute("SELECT MAX(season) FROM player_week_stats")
            season = cursor.fetchone()[0] or 2024

        # Get all weekly scores for QBs and WR/TEs
        cursor.execute("""
            SELECT p.player_id, p.full_name, p.position, s.team,
                   s.week, s.fantasy_points_ppr
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
              AND p.position IN ('QB', 'WR', 'TE')
              AND s.fantasy_points_ppr IS NOT NULL
            ORDER BY p.player_id, s.week
        """, [season])

        from collections import defaultdict
        player_weeks = defaultdict(dict)
        player_info = {}
        for r in cursor.fetchall():
            pid = r[0]
            player_weeks[pid][r[4]] = r[5] or 0
            if pid not in player_info:
                player_info[pid] = {
                    "player_id": pid,
                    "name": r[1] or "Unknown",
                    "position": r[2] or "WR",
                    "team": r[3] or "FA",
                }

        # Group by team
        team_qbs = defaultdict(list)
        team_receivers = defaultdict(list)
        for pid, info in player_info.items():
            if info["position"] == "QB":
                team_qbs[info["team"]].append(pid)
            elif info["position"] in ("WR", "TE"):
                team_receivers[info["team"]].append(pid)

        import math
        stacks = []
        for team in team_qbs:
            if team not in team_receivers:
                continue
            for qb_id in team_qbs[team]:
                qb_info = player_info[qb_id]
                qb_weeks = player_weeks[qb_id]
                if len(qb_weeks) < 5:
                    continue

                qb_ppg = sum(qb_weeks.values()) / len(qb_weeks)

                for rec_id in team_receivers[team]:
                    rec_info = player_info[rec_id]
                    rec_weeks = player_weeks[rec_id]

                    # Find common weeks
                    common = sorted(set(qb_weeks.keys()) & set(rec_weeks.keys()))
                    if len(common) < 5:
                        continue

                    qb_scores = [qb_weeks[w] for w in common]
                    rec_scores = [rec_weeks[w] for w in common]

                    # Pearson correlation
                    n = len(common)
                    mean_q = sum(qb_scores) / n
                    mean_r = sum(rec_scores) / n
                    num = sum((qb_scores[i] - mean_q) * (rec_scores[i] - mean_r) for i in range(n))
                    den_q = math.sqrt(sum((qb_scores[i] - mean_q) ** 2 for i in range(n)))
                    den_r = math.sqrt(sum((rec_scores[i] - mean_r) ** 2 for i in range(n)))
                    corr = num / (den_q * den_r) if den_q > 0 and den_r > 0 else 0

                    rec_ppg = sum(rec_scores) / n

                    stacks.append({
                        "team": team,
                        "qb_name": qb_info["name"],
                        "qb_id": qb_id,
                        "qb_ppg": round(qb_ppg, 1),
                        "receiver_name": rec_info["name"],
                        "receiver_id": rec_id,
                        "receiver_pos": rec_info["position"],
                        "receiver_ppg": round(rec_ppg, 1),
                        "correlation": round(corr, 3),
                        "common_games": n,
                        "combined_ppg": round(qb_ppg + rec_ppg, 1),
                    })

        stacks.sort(key=lambda x: x["correlation"], reverse=True)
        stacks = stacks[:limit]

        return {
            "stacks": stacks,
            "season": season,
            "count": len(stacks),
        }


def fetch_positional_advantage(season=None, position=None, limit=40):
    """
    Positional advantage — players who provide the biggest scoring edge
    over the positional average PPG. Distinct from VORP (replacement level).
    """
    with get_db() as conn:
        cursor = conn.cursor()

        if not season:
            cursor.execute("SELECT MAX(season) FROM player_week_stats")
            season = cursor.fetchone()[0] or 2024

        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        # Get all player season stats
        cursor.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   SUM(s.fantasy_points_ppr) as total_ppr,
                   COUNT(DISTINCT s.week) as games
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
              AND p.position IN ('QB', 'RB', 'WR', 'TE')
              {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 6
            ORDER BY total_ppr DESC
        """, params)

        players_raw = []
        pos_ppg_sums = {"QB": [], "RB": [], "WR": [], "TE": []}
        for r in cursor.fetchall():
            pos = r[2] or "RB"
            games = r[5] or 1
            ppg = (r[4] or 0) / games
            players_raw.append({
                "player_id": r[0],
                "name": r[1] or "Unknown",
                "position": pos,
                "team": r[3] or "FA",
                "total_ppr": round(r[4] or 0, 1),
                "games": games,
                "ppg": round(ppg, 1),
            })
            if pos in pos_ppg_sums:
                pos_ppg_sums[pos].append(ppg)

        # Compute positional averages
        pos_avg = {}
        for pos in ("QB", "RB", "WR", "TE"):
            vals = pos_ppg_sums.get(pos, [])
            pos_avg[pos] = sum(vals) / len(vals) if vals else 0

        players = []
        for p in players_raw:
            avg = pos_avg.get(p["position"], 0)
            advantage = p["ppg"] - avg
            pct_above = (advantage / avg * 100) if avg > 0 else 0

            players.append({
                **p,
                "pos_avg": round(avg, 1),
                "advantage": round(advantage, 1),
                "pct_above": round(pct_above, 0),
            })

        # Sort by advantage descending
        players.sort(key=lambda x: x["advantage"], reverse=True)
        players = players[:limit]

        return {
            "players": players,
            "pos_averages": {k: round(v, 1) for k, v in pos_avg.items()},
            "season": season,
            "count": len(players),
        }


def fetch_td_regression(season=None, position=None, limit=50):
    """TD regression candidates — expected vs actual TDs based on opportunity volume."""
    with get_db() as conn:
        cursor = conn.cursor()
        if not season:
            cursor.execute("SELECT MAX(season) FROM player_season_stats")
            season = cursor.fetchone()[0] or 2025

        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        cursor.execute(f"""
            SELECT p.gsis_id, p.full_name, p.position, p.team,
                   s.rushing_tds, s.receiving_tds, s.passing_tds,
                   s.carries, s.targets, s.passing_attempts,
                   s.games
            FROM player_season_stats s
            JOIN players p ON p.gsis_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
            {pos_filter}
            AND s.games >= 4
        """, params)

        # Compute league-average TD rate per position
        pos_opp_td = {"QB": [], "RB": [], "WR": [], "TE": []}
        rows = []
        for r in cursor.fetchall():
            pid, name, pos, team = r[0], r[1] or "Unknown", r[2] or "RB", r[3] or "FA"
            rush_td = r[4] or 0
            rec_td = r[5] or 0
            pass_td = r[6] or 0
            carries = r[7] or 0
            targets = r[8] or 0
            pass_att = r[9] or 0
            games = r[10] or 1

            if pos == "QB":
                opportunities = pass_att + carries
                actual_tds = pass_td + rush_td
            else:
                opportunities = carries + targets
                actual_tds = rush_td + rec_td

            if opportunities < 20:
                continue

            td_rate = actual_tds / opportunities if opportunities > 0 else 0
            rows.append({
                "player_id": pid, "name": name, "position": pos, "team": team,
                "actual_tds": actual_tds, "opportunities": opportunities,
                "td_rate": td_rate, "games": games,
                "tds_per_game": actual_tds / games,
            })
            if pos in pos_opp_td:
                pos_opp_td[pos].append((opportunities, actual_tds))

        # Expected TD rate = positional avg TD rate
        pos_avg_td_rate = {}
        for pos in ("QB", "RB", "WR", "TE"):
            pairs = pos_opp_td.get(pos, [])
            total_opp = sum(p[0] for p in pairs)
            total_td = sum(p[1] for p in pairs)
            pos_avg_td_rate[pos] = total_td / total_opp if total_opp > 0 else 0

        players = []
        for p in rows:
            avg_rate = pos_avg_td_rate.get(p["position"], 0)
            expected_tds = p["opportunities"] * avg_rate
            td_diff = p["actual_tds"] - expected_tds
            regression_pct = (td_diff / expected_tds * 100) if expected_tds > 0 else 0

            players.append({
                "player_id": p["player_id"],
                "name": p["name"],
                "position": p["position"],
                "team": p["team"],
                "games": p["games"],
                "actual_tds": p["actual_tds"],
                "expected_tds": round(expected_tds, 1),
                "td_diff": round(td_diff, 1),
                "regression_pct": round(regression_pct, 0),
                "td_rate": round(p["td_rate"] * 100, 1),
                "avg_td_rate": round(avg_rate * 100, 1),
                "opportunities": p["opportunities"],
                "tds_per_game": round(p["tds_per_game"], 1),
            })

        # Positive regression = actual < expected (buy candidates)
        positive = sorted([p for p in players if p["td_diff"] < -0.5], key=lambda x: x["td_diff"])[:limit]
        # Negative regression = actual > expected (sell candidates)
        negative = sorted([p for p in players if p["td_diff"] > 0.5], key=lambda x: x["td_diff"], reverse=True)[:limit]

        return {
            "positive_regression": positive,
            "negative_regression": negative,
            "pos_avg_td_rates": {k: round(v * 100, 1) for k, v in pos_avg_td_rate.items()},
            "season": season,
        }


def fetch_dual_threat(season=None, position=None, limit=50):
    """Dual-threat index — players who contribute in both rushing and receiving."""
    with get_db() as conn:
        cursor = conn.cursor()
        if not season:
            cursor.execute("SELECT MAX(season) FROM player_season_stats")
            season = cursor.fetchone()[0] or 2025

        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        cursor.execute(f"""
            SELECT p.gsis_id, p.full_name, p.position, p.team,
                   s.rushing_yards, s.receiving_yards, s.carries, s.receptions,
                   s.targets, s.rushing_tds, s.receiving_tds, s.games
            FROM player_season_stats s
            JOIN players p ON p.gsis_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
            {pos_filter}
            AND s.games >= 4
        """, params)

        players = []
        for r in cursor.fetchall():
            pid, name, pos, team = r[0], r[1] or "Unknown", r[2] or "RB", r[3] or "FA"
            rush_yd = r[4] or 0
            rec_yd = r[5] or 0
            carries = r[6] or 0
            receptions = r[7] or 0
            targets = r[8] or 0
            rush_td = r[9] or 0
            rec_td = r[10] or 0
            games = r[11] or 1

            # Need contributions in both dimensions
            if rush_yd < 50 and rec_yd < 50:
                continue

            rush_yd_pg = rush_yd / games
            rec_yd_pg = rec_yd / games
            total_yd_pg = rush_yd_pg + rec_yd_pg
            carries_pg = carries / games
            rec_pg = receptions / games

            # Dual-threat index: geometric mean of rush and rec yards/game
            # Rewards balance — 100 rush + 100 rec >> 200 rush + 0 rec
            rush_component = max(rush_yd_pg, 0.1)
            rec_component = max(rec_yd_pg, 0.1)
            dti = math.sqrt(rush_component * rec_component)

            # Rush/rec split (0.5 = perfectly balanced)
            total = rush_yd + rec_yd
            rush_pct = (rush_yd / total * 100) if total > 0 else 50
            rec_pct = 100 - rush_pct

            players.append({
                "player_id": pid,
                "name": name,
                "position": pos,
                "team": team,
                "games": games,
                "dti": round(dti, 1),
                "rush_yd_pg": round(rush_yd_pg, 1),
                "rec_yd_pg": round(rec_yd_pg, 1),
                "total_yd_pg": round(total_yd_pg, 1),
                "carries_pg": round(carries_pg, 1),
                "rec_pg": round(rec_pg, 1),
                "rush_td": rush_td,
                "rec_td": rec_td,
                "rush_pct": round(rush_pct, 0),
                "rec_pct": round(rec_pct, 0),
            })

        players.sort(key=lambda x: x["dti"], reverse=True)
        players = players[:limit]

        return {
            "players": players,
            "season": season,
            "count": len(players),
        }


def fetch_season_pace(season=None, position=None, limit=50):
    """Season pace tracker — projects season totals and milestone tracking."""
    with get_db() as conn:
        cursor = conn.cursor()
        if not season:
            cursor.execute("SELECT MAX(season) FROM player_season_stats")
            season = cursor.fetchone()[0] or 2025

        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        cursor.execute(f"""
            SELECT p.gsis_id, p.full_name, p.position, p.team,
                   s.games, s.passing_yards, s.passing_tds,
                   s.rushing_yards, s.rushing_tds,
                   s.receiving_yards, s.receiving_tds, s.receptions,
                   s.carries, s.targets
            FROM player_season_stats s
            JOIN players p ON p.gsis_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
            {pos_filter}
            AND s.games >= 3
        """, params)

        full_season = 17
        players = []
        for r in cursor.fetchall():
            pid, name, pos, team = r[0], r[1] or "Unknown", r[2] or "RB", r[3] or "FA"
            games = r[4] or 1
            pass_yd = r[5] or 0
            pass_td = r[6] or 0
            rush_yd = r[7] or 0
            rush_td = r[8] or 0
            rec_yd = r[9] or 0
            rec_td = r[10] or 0
            recs = r[11] or 0
            carries = r[12] or 0
            targets = r[13] or 0

            pace_factor = full_season / games

            # Projected season totals
            proj = {
                "pass_yd": round(pass_yd * pace_factor),
                "pass_td": round(pass_td * pace_factor, 1),
                "rush_yd": round(rush_yd * pace_factor),
                "rush_td": round(rush_td * pace_factor, 1),
                "rec_yd": round(rec_yd * pace_factor),
                "rec_td": round(rec_td * pace_factor, 1),
                "recs": round(recs * pace_factor),
            }

            # Check milestones
            milestones = []
            if pos == "QB":
                if proj["pass_yd"] >= 4000: milestones.append("4000 pass yd")
                if proj["pass_yd"] >= 5000: milestones.append("5000 pass yd")
                if proj["pass_td"] >= 30: milestones.append("30 pass TD")
                if proj["pass_td"] >= 40: milestones.append("40 pass TD")
                if proj["rush_yd"] >= 500: milestones.append("500 rush yd")
            if pos in ("RB", "WR", "TE", "QB"):
                if proj["rush_yd"] >= 1000: milestones.append("1000 rush yd")
                if proj["rush_yd"] >= 1500: milestones.append("1500 rush yd")
                if proj["rush_td"] >= 10: milestones.append("10 rush TD")
            if pos in ("WR", "TE", "RB"):
                if proj["rec_yd"] >= 1000: milestones.append("1000 rec yd")
                if proj["rec_yd"] >= 1500: milestones.append("1500 rec yd")
                if proj["rec_td"] >= 10: milestones.append("10 rec TD")
                if proj["recs"] >= 100: milestones.append("100 rec")

            if not milestones:
                continue

            # PPR for sorting
            ppr = (pass_yd * 0.04 + pass_td * 4 +
                   rush_yd * 0.1 + rush_td * 6 +
                   rec_yd * 0.1 + rec_td * 6 + recs * 1)
            ppg = ppr / games

            players.append({
                "player_id": pid,
                "name": name,
                "position": pos,
                "team": team,
                "games": games,
                "ppg": round(ppg, 1),
                "projected": proj,
                "milestones": milestones,
                "milestone_count": len(milestones),
            })

        players.sort(key=lambda x: (-x["milestone_count"], -x["ppg"]))
        players = players[:limit]

        return {
            "players": players,
            "season": season,
            "full_season_games": full_season,
            "count": len(players),
        }


def fetch_target_premium(season=None, position=None, limit=50):
    """Target premium — target quality composite for pass catchers."""
    with get_db() as conn:
        cursor = conn.cursor()
        if not season:
            cursor.execute("SELECT MAX(season) FROM player_season_stats")
            season = cursor.fetchone()[0] or 2025

        pos_filter = "AND p.position IN ('WR','TE','RB')"
        params = [season]
        if position and position in ("WR", "TE", "RB"):
            pos_filter = "AND p.position = ?"
            params.append(position)

        cursor.execute(f"""
            SELECT p.gsis_id, p.full_name, p.position, p.team,
                   s.targets, s.receptions, s.receiving_yards,
                   s.receiving_air_yards, s.receiving_yards_after_catch,
                   s.games
            FROM player_season_stats s
            JOIN players p ON p.gsis_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
            {pos_filter}
            AND s.games >= 4 AND s.targets >= 20
        """, params)

        all_adot = []
        all_catch_rate = []
        all_yac = []
        all_ypt = []
        rows = []

        for r in cursor.fetchall():
            pid, name, pos, team = r[0], r[1] or "Unknown", r[2] or "WR", r[3] or "FA"
            targets = r[4] or 0
            recs = r[5] or 0
            rec_yd = r[6] or 0
            air_yd = r[7] or 0
            yac = r[8] or 0
            games = r[9] or 1

            if targets < 1:
                continue

            adot = air_yd / targets
            catch_rate = recs / targets * 100
            yac_per_rec = yac / recs if recs > 0 else 0
            ypt = rec_yd / targets

            all_adot.append(adot)
            all_catch_rate.append(catch_rate)
            all_yac.append(yac_per_rec)
            all_ypt.append(ypt)

            rows.append({
                "player_id": pid, "name": name, "position": pos, "team": team,
                "games": games, "targets": targets,
                "targets_pg": round(targets / games, 1),
                "adot": adot, "catch_rate": catch_rate,
                "yac_per_rec": yac_per_rec, "ypt": ypt,
            })

        if not rows:
            return {"players": [], "season": season, "count": 0}

        # Compute percentiles for composite
        def pct_rank(val, arr):
            below = sum(1 for v in arr if v < val)
            return below / len(arr) * 100 if arr else 50

        players = []
        for p in rows:
            adot_pct = pct_rank(p["adot"], all_adot)
            cr_pct = pct_rank(p["catch_rate"], all_catch_rate)
            yac_pct = pct_rank(p["yac_per_rec"], all_yac)
            ypt_pct = pct_rank(p["ypt"], all_ypt)

            # Target Premium = 30% YPT + 25% catch rate + 25% YAC + 20% aDOT
            premium = ypt_pct * 0.30 + cr_pct * 0.25 + yac_pct * 0.25 + adot_pct * 0.20

            players.append({
                "player_id": p["player_id"],
                "name": p["name"],
                "position": p["position"],
                "team": p["team"],
                "games": p["games"],
                "premium": round(premium, 0),
                "targets_pg": p["targets_pg"],
                "adot": round(p["adot"], 1),
                "catch_rate": round(p["catch_rate"], 1),
                "yac_per_rec": round(p["yac_per_rec"], 1),
                "ypt": round(p["ypt"], 1),
            })

        players.sort(key=lambda x: x["premium"], reverse=True)
        players = players[:limit]

        return {
            "players": players,
            "season": season,
            "count": len(players),
        }


def fetch_workload_monitor(season=None, position=None, limit=50):
    """Workload monitor — snap counts, touches/game, heavy usage flags."""
    with get_db() as conn:
        cursor = conn.cursor()
        if not season:
            cursor.execute("SELECT MAX(season) FROM player_season_stats")
            season = cursor.fetchone()[0] or 2025

        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        cursor.execute(f"""
            SELECT p.gsis_id, p.full_name, p.position, p.team,
                   s.games, s.offense_snaps, s.offense_pct,
                   s.carries, s.targets, s.receptions,
                   s.rushing_yards, s.receiving_yards
            FROM player_season_stats s
            JOIN players p ON p.gsis_id = s.player_id
            WHERE s.season = ? AND p.fantasy_relevant = 1
            {pos_filter}
            AND s.games >= 4
        """, params)

        players = []
        for r in cursor.fetchall():
            pid, name, pos, team = r[0], r[1] or "Unknown", r[2] or "RB", r[3] or "FA"
            games = r[4] or 1
            snaps = r[5] or 0
            snap_pct = r[6]
            carries = r[7] or 0
            targets = r[8] or 0
            recs = r[9] or 0
            rush_yd = r[10] or 0
            rec_yd = r[11] or 0

            touches = carries + recs
            touches_pg = touches / games
            snaps_pg = snaps / games
            carries_pg = carries / games
            targets_pg = targets / games
            total_yd_pg = (rush_yd + rec_yd) / games

            if touches_pg < 3 and snaps_pg < 15:
                continue

            # Workload flags
            flags = []
            if pos in ("RB",) and touches_pg >= 20: flags.append("bell cow")
            if pos in ("RB",) and touches_pg >= 25: flags.append("extreme volume")
            if snap_pct and snap_pct >= 85: flags.append("snap hog")
            if pos in ("WR", "TE") and targets_pg >= 10: flags.append("target monster")
            if snaps_pg >= 65: flags.append("iron man")

            workload_score = (touches_pg * 3) + (snaps_pg * 0.3)
            if snap_pct:
                workload_score += snap_pct * 0.2

            players.append({
                "player_id": pid,
                "name": name,
                "position": pos,
                "team": team,
                "games": games,
                "snaps_pg": round(snaps_pg, 1),
                "snap_pct": round(snap_pct, 1) if snap_pct else None,
                "touches_pg": round(touches_pg, 1),
                "carries_pg": round(carries_pg, 1),
                "targets_pg": round(targets_pg, 1),
                "total_yd_pg": round(total_yd_pg, 1),
                "workload": round(workload_score, 0),
                "flags": flags,
            })

        players.sort(key=lambda x: x["workload"], reverse=True)
        players = players[:limit]

        return {
            "players": players,
            "season": season,
            "count": len(players),
        }


def fetch_drop_rate(season=None, position=None, limit=50):
    """Rank pass catchers by drop rate — sure hands vs butterfingers."""
    with get_db() as conn:
        if not season:
            cur = conn.execute("SELECT MAX(season) FROM player_season_pbp")
            season = cur.fetchone()[0] or 2024

        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        rows = conn.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   pb.drops, pb.drop_rate,
                   SUM(w.targets) as targets,
                   SUM(w.receptions) as receptions,
                   SUM(w.receiving_yards) as rec_yds,
                   SUM(w.receiving_yards_after_catch) as yac,
                   COUNT(DISTINCT w.week) as games
            FROM player_season_pbp pb
            JOIN players p ON p.player_id = pb.player_id
            JOIN player_week_stats w ON w.player_id = pb.player_id AND w.season = pb.season
                AND w.season_type = 'REG'
            WHERE pb.season = ?
              AND p.position IN ('WR','TE','RB')
              AND p.fantasy_relevant = 1
              AND pb.drops IS NOT NULL
              {pos_filter}
            GROUP BY p.player_id
            HAVING targets >= 20
        """, params).fetchall()

        sure_hands = []
        butterfingers = []

        for r in rows:
            pid, name, pos, team, drops, drop_rate, targets, recs, rec_yds, yac, games = r
            drops = drops or 0
            drop_rate_pct = (drop_rate or 0) * 100 if drop_rate and drop_rate < 1 else (drop_rate or 0)
            targets = targets or 0
            recs = recs or 0
            yac = yac or 0

            catch_rate = (recs / targets * 100) if targets > 0 else 0
            tgt_pg = targets / games if games > 0 else 0
            yac_per_rec = yac / recs if recs > 0 else 0

            entry = {
                "player_id": pid,
                "name": name,
                "position": pos,
                "team": team,
                "games": games,
                "drops": drops,
                "drop_rate": round(drop_rate_pct, 1),
                "targets": targets,
                "catch_rate": round(catch_rate, 1),
                "tgt_pg": round(tgt_pg, 1),
                "yac_per_rec": round(yac_per_rec, 1),
            }

            if drop_rate_pct <= 8:
                sure_hands.append(entry)
            if drop_rate_pct >= 15:
                butterfingers.append(entry)

        sure_hands.sort(key=lambda x: x["drop_rate"])
        butterfingers.sort(key=lambda x: x["drop_rate"], reverse=True)

        return {
            "sure_hands": sure_hands[:limit],
            "butterfingers": butterfingers[:limit],
            "season": season,
            "count": len(sure_hands) + len(butterfingers),
        }


def fetch_success_rate(season=None, position=None, limit=50):
    """Rank players by rush/pass success rate from PBP data."""
    with get_db() as conn:
        if not season:
            cur = conn.execute("SELECT MAX(season) FROM player_season_pbp")
            season = cur.fetchone()[0] or 2024

        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        rows = conn.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   pb.rush_success_rate, pb.pass_success_rate,
                   SUM(w.carries) as carries,
                   SUM(w.rushing_yards) as rush_yds,
                   SUM(w.rushing_tds) as rush_tds,
                   SUM(w.attempts) as pass_att,
                   SUM(w.passing_yards) as pass_yds,
                   SUM(w.passing_tds) as pass_tds,
                   SUM(w.fantasy_points_ppr) as total_ppr,
                   COUNT(DISTINCT w.week) as games
            FROM player_season_pbp pb
            JOIN players p ON p.player_id = pb.player_id
            JOIN player_week_stats w ON w.player_id = pb.player_id AND w.season = pb.season
                AND w.season_type = 'REG'
            WHERE pb.season = ?
              AND p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
              AND (pb.rush_success_rate IS NOT NULL OR pb.pass_success_rate IS NOT NULL)
              {pos_filter}
            GROUP BY p.player_id
        """, params).fetchall()

        players = []
        for r in rows:
            pid, name, pos, team, rush_sr, pass_sr, carries, rush_yds, rush_tds, pass_att, pass_yds, pass_tds, total_ppr, games = r
            carries = carries or 0
            rush_yds = rush_yds or 0
            pass_att = pass_att or 0
            total_ppr = total_ppr or 0

            # Determine primary metric
            if pos == "QB":
                primary_sr = pass_sr if pass_sr else rush_sr
                sr_type = "pass" if pass_sr else "rush"
                volume = pass_att if pass_sr else carries
                if volume < 50:
                    continue
            else:
                primary_sr = rush_sr
                sr_type = "rush"
                volume = carries
                if volume < 30:
                    continue

            if not primary_sr:
                continue

            ppg = total_ppr / games if games > 0 else 0
            ypc = rush_yds / carries if carries > 0 else 0

            players.append({
                "player_id": pid,
                "name": name,
                "position": pos,
                "team": team,
                "games": games,
                "success_rate": round(primary_sr * 100, 1),
                "sr_type": sr_type,
                "rush_sr": round(rush_sr * 100, 1) if rush_sr else None,
                "pass_sr": round(pass_sr * 100, 1) if pass_sr else None,
                "volume": volume,
                "ppg": round(ppg, 1),
                "ypc": round(ypc, 1) if carries > 0 else None,
            })

        players.sort(key=lambda x: x["success_rate"], reverse=True)

        return {
            "players": players[:limit],
            "season": season,
            "count": len(players),
        }


def fetch_game_script(season=None, position=None, limit=40):
    """Show how game script (avg score diff) correlates with fantasy production."""
    with get_db() as conn:
        row = conn.execute("SELECT DISTINCT season FROM player_season_pbp ORDER BY season DESC").fetchall()
        available_seasons = [r[0] for r in row] if row else [2024]
        if not season:
            season = available_seasons[0] if available_seasons else 2024

        pos_filter = ""
        params = [season]
        if position:
            pos_filter = "AND p.position = ?"
            params.append(position)

        rows = conn.execute(f"""
            SELECT p.player_id, p.full_name, p.position, p.team,
                   pb.avg_score_differential, pb.garbage_time_pct,
                   SUM(w.fantasy_points_ppr) as total_ppr,
                   COUNT(DISTINCT w.week) as games
            FROM player_season_pbp pb
            JOIN players p ON p.player_id = pb.player_id
            JOIN player_week_stats w ON w.player_id = pb.player_id AND w.season = pb.season
                AND w.season_type = 'REG'
            WHERE pb.season = ?
              AND p.position IN ('QB','RB','WR','TE')
              AND p.fantasy_relevant = 1
              AND pb.avg_score_differential IS NOT NULL
              {pos_filter}
            GROUP BY p.player_id
            HAVING games >= 4 AND total_ppr > 0
        """, params).fetchall()

        positive_script = []
        negative_script = []

        for r in rows:
            pid, name, pos, team, avg_diff, gt_pct, total_ppr, games = r
            ppg = total_ppr / games if games > 0 else 0
            if ppg < 5:
                continue

            gt_pct = gt_pct or 0

            entry = {
                "player_id": pid,
                "name": name,
                "position": pos,
                "team": team,
                "games": games,
                "ppg": round(ppg, 1),
                "avg_diff": round(avg_diff, 1),
                "gt_pct": round(gt_pct * 100 if gt_pct < 1 else gt_pct, 1),
            }

            if avg_diff > 0:
                positive_script.append(entry)
            else:
                negative_script.append(entry)

        positive_script.sort(key=lambda x: x["ppg"], reverse=True)
        negative_script.sort(key=lambda x: x["ppg"], reverse=True)

        return {
            "positive_script": positive_script[:limit],
            "negative_script": negative_script[:limit],
            "season": season,
            "available_seasons": available_seasons,
            "count": len(positive_script) + len(negative_script),
        }


# ---------------------------------------------------------------------------
# Draft Class Tracker
# ---------------------------------------------------------------------------

def fetch_draft_class_tracker(draft_year=None, position=None):
    """
    Return drafted players from a given year with career fantasy production
    and hit/miss classification.
    """
    with get_db() as conn:
        # Available draft years
        year_rows = conn.execute(
            "SELECT DISTINCT season FROM draft_picks WHERE position IN ('QB','RB','WR','TE') ORDER BY season DESC"
        ).fetchall()
        available_years = [r[0] for r in year_rows] if year_rows else [2024]

        if not draft_year:
            draft_year = available_years[0] if available_years else 2024

        # Fetch all skill position picks for this draft year
        pos_filter = ""
        params = [draft_year]
        if position and position != "ALL":
            pos_filter = " AND d.position = ?"
            params.append(position)

        rows = conn.execute(f"""
            SELECT
                d.player_name, d.position, d.round, d.pick, d.team AS draft_team,
                d.college, d.age AS draft_age,
                d.games AS career_games,
                d.pass_yards, d.pass_tds, d.rush_yards, d.rush_tds,
                d.receptions, d.rec_yards, d.rec_tds,
                d.career_av, d.allpro, d.probowls, d.seasons_started
            FROM draft_picks d
            WHERE d.season = ? AND d.position IN ('QB','RB','WR','TE')
            {pos_filter}
            ORDER BY d.round, d.pick
        """, params).fetchall()

        players = []
        round_stats = {}  # round -> {total, hits, busts}

        for r in rows:
            games = r["career_games"] or 0
            # Compute career fantasy PPG (PPR)
            pass_yds = r["pass_yards"] or 0
            pass_tds = r["pass_tds"] or 0
            rush_yds = r["rush_yards"] or 0
            rush_tds = r["rush_tds"] or 0
            recs = r["receptions"] or 0
            rec_yds = r["rec_yards"] or 0
            rec_tds = r["rec_tds"] or 0

            career_fpts = (pass_yds * 0.04 + pass_tds * 4 +
                          rush_yds * 0.1 + rush_tds * 6 +
                          recs * 1.0 + rec_yds * 0.1 + rec_tds * 6)
            career_ppg = round(career_fpts / games, 1) if games > 0 else 0.0

            # Hit/miss classification based on position expectations
            pos = r["position"]
            rd = r["round"]

            # Classification: Hit = exceeded expectations, Miss = below
            if rd <= 2:
                # Early picks: high bar
                hit_threshold = {"QB": 14, "RB": 12, "WR": 10, "TE": 8}.get(pos, 10)
            elif rd <= 4:
                # Mid-round: moderate bar
                hit_threshold = {"QB": 10, "RB": 8, "WR": 7, "TE": 5}.get(pos, 7)
            else:
                # Late round: low bar
                hit_threshold = {"QB": 6, "RB": 5, "WR": 4, "TE": 3}.get(pos, 4)

            if games < 16:
                classification = "too_early" if (2026 - draft_year) <= 2 else "bust"
            elif career_ppg >= hit_threshold * 1.3:
                classification = "stud"
            elif career_ppg >= hit_threshold:
                classification = "hit"
            elif career_ppg >= hit_threshold * 0.6:
                classification = "average"
            else:
                classification = "bust"

            # Track round stats
            if rd not in round_stats:
                round_stats[rd] = {"total": 0, "hits": 0, "busts": 0, "studs": 0}
            round_stats[rd]["total"] += 1
            if classification == "stud":
                round_stats[rd]["studs"] += 1
                round_stats[rd]["hits"] += 1
            elif classification == "hit":
                round_stats[rd]["hits"] += 1
            elif classification == "bust":
                round_stats[rd]["busts"] += 1

            players.append({
                "player_name": r["player_name"],
                "position": pos,
                "round": rd,
                "pick": r["pick"],
                "draft_team": r["draft_team"],
                "college": r["college"],
                "draft_age": r["draft_age"],
                "career_games": games,
                "career_ppg": career_ppg,
                "career_fpts": round(career_fpts, 1),
                "pass_yards": pass_yds,
                "pass_tds": pass_tds,
                "rush_yards": rush_yds,
                "rush_tds": rush_tds,
                "receptions": recs,
                "rec_yards": rec_yds,
                "rec_tds": rec_tds,
                "career_av": r["career_av"] or 0,
                "allpro": r["allpro"] or 0,
                "probowls": r["probowls"] or 0,
                "classification": classification,
            })

        # Position breakdown
        pos_breakdown = {}
        for p in players:
            pos = p["position"]
            if pos not in pos_breakdown:
                pos_breakdown[pos] = {"total": 0, "studs": 0, "hits": 0, "busts": 0, "avg_ppg": 0, "ppg_sum": 0}
            pos_breakdown[pos]["total"] += 1
            pos_breakdown[pos]["ppg_sum"] += p["career_ppg"]
            if p["classification"] == "stud":
                pos_breakdown[pos]["studs"] += 1
            elif p["classification"] == "hit":
                pos_breakdown[pos]["hits"] += 1
            elif p["classification"] == "bust":
                pos_breakdown[pos]["busts"] += 1

        for pos in pos_breakdown:
            t = pos_breakdown[pos]["total"]
            pos_breakdown[pos]["avg_ppg"] = round(pos_breakdown[pos]["ppg_sum"] / t, 1) if t > 0 else 0
            del pos_breakdown[pos]["ppg_sum"]

        # Round breakdown as sorted list
        round_breakdown = []
        for rd in sorted(round_stats.keys()):
            rs = round_stats[rd]
            hit_rate = round(rs["hits"] / rs["total"] * 100, 1) if rs["total"] > 0 else 0
            round_breakdown.append({
                "round": rd,
                "total": rs["total"],
                "studs": rs["studs"],
                "hits": rs["hits"],
                "busts": rs["busts"],
                "hit_rate": hit_rate,
            })

        return {
            "draft_year": draft_year,
            "available_years": available_years,
            "players": players,
            "position_breakdown": pos_breakdown,
            "round_breakdown": round_breakdown,
            "total_picks": len(players),
        }


# ---------------------------------------------------------------------------
# Stat Correlation Matrix
# ---------------------------------------------------------------------------

_CORR_STATS = {
    "ppg": ("SUM(s.fantasy_points_ppr) / COUNT(DISTINCT s.week)", "PPG"),
    "tgt_g": ("SUM(s.targets) / COUNT(DISTINCT s.week)", "Tgt/G"),
    "rec_g": ("SUM(s.receptions) / COUNT(DISTINCT s.week)", "Rec/G"),
    "rec_yd_g": ("SUM(s.receiving_yards) / COUNT(DISTINCT s.week)", "Rec Yd/G"),
    "car_g": ("SUM(s.carries) / COUNT(DISTINCT s.week)", "Car/G"),
    "rush_yd_g": ("SUM(s.rushing_yards) / COUNT(DISTINCT s.week)", "Rush Yd/G"),
    "pass_yd_g": ("SUM(s.passing_yards) / COUNT(DISTINCT s.week)", "Pass Yd/G"),
    "td_g": ("SUM(s.touchdowns) / COUNT(DISTINCT s.week)", "TD/G"),
    "catch_rate": ("CASE WHEN SUM(s.targets) > 0 THEN SUM(s.receptions) * 100.0 / SUM(s.targets) ELSE NULL END", "Catch%"),
    "ypc": ("CASE WHEN SUM(s.carries) > 0 THEN SUM(s.rushing_yards) * 1.0 / SUM(s.carries) ELSE NULL END", "YPC"),
    "ypr": ("CASE WHEN SUM(s.receptions) > 0 THEN SUM(s.receiving_yards) * 1.0 / SUM(s.receptions) ELSE NULL END", "YPR"),
    "snap_pct": ("AVG(s.offense_pct)", "Snap%"),
    "td_rate": ("CASE WHEN (SUM(s.carries) + SUM(s.targets)) > 0 THEN SUM(s.touchdowns) * 100.0 / (SUM(s.carries) + SUM(s.targets)) ELSE NULL END", "TD Rate"),
}


def fetch_stat_correlations(season=None, position=None, x_stat=None, y_stat=None):
    """Compute Pearson correlations between fantasy stat pairs."""
    with get_db() as conn:
        # Build the season filter
        where = ["p.position IN ('QB','RB','WR','TE')"]
        params = []
        if season:
            where.append("s.season = ?")
            params.append(int(season))
        if position and position.upper() in FANTASY_POSITIONS:
            where.append("p.position = ?")
            params.append(position.upper())

        where_clause = " AND ".join(where)

        # Build SELECT for all stats
        select_parts = []
        stat_keys = list(_CORR_STATS.keys())
        for key in stat_keys:
            expr = _CORR_STATS[key][0]
            select_parts.append(f"({expr}) as {key}")

        query = f"""
            SELECT p.player_id, p.full_name, p.position,
                   {', '.join(select_parts)}
            FROM player_week_stats s
            JOIN players p ON p.player_id = s.player_id
            WHERE {where_clause}
              AND s.season_type = 'regular'
            GROUP BY s.player_id, s.season
            HAVING COUNT(DISTINCT s.week) >= 6
        """
        rows = conn.execute(query, params).fetchall()

        if len(rows) < 30:
            return {"error": "Not enough data for correlations", "count": len(rows)}

        # Extract stat arrays (skip NULLs)
        stat_arrays = {k: [] for k in stat_keys}
        player_data = []
        for row in rows:
            pid, name, pos = row[0], row[1], row[2]
            vals = {}
            for i, key in enumerate(stat_keys):
                vals[key] = row[3 + i]
            player_data.append({"pid": pid, "name": name, "pos": pos, "vals": vals})
            for key in stat_keys:
                stat_arrays[key].append(vals[key])

        # Pearson correlation
        def pearson(xs, ys):
            pairs = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
            n = len(pairs)
            if n < 10:
                return None
            mx = sum(p[0] for p in pairs) / n
            my = sum(p[1] for p in pairs) / n
            sx = math.sqrt(sum((p[0] - mx) ** 2 for p in pairs))
            sy = math.sqrt(sum((p[1] - my) ** 2 for p in pairs))
            if sx == 0 or sy == 0:
                return None
            cov = sum((p[0] - mx) * (p[1] - my) for p in pairs)
            return round(cov / (sx * sy), 3)

        # Build correlation matrix
        matrix = {}
        for i, k1 in enumerate(stat_keys):
            matrix[k1] = {}
            for j, k2 in enumerate(stat_keys):
                if i == j:
                    matrix[k1][k2] = 1.0
                elif j < i and k2 in matrix and k1 in matrix[k2]:
                    matrix[k1][k2] = matrix[k2][k1]
                else:
                    matrix[k1][k2] = pearson(stat_arrays[k1], stat_arrays[k2])

        # Top predictors of PPG
        ppg_corrs = []
        for key in stat_keys:
            if key == "ppg":
                continue
            r = matrix["ppg"].get(key)
            if r is not None:
                ppg_corrs.append({"stat": key, "label": _CORR_STATS[key][1], "r": r, "abs_r": abs(r)})
        ppg_corrs.sort(key=lambda x: x["abs_r"], reverse=True)

        # Scatter data for specific pair
        scatter = None
        if x_stat and y_stat and x_stat in _CORR_STATS and y_stat in _CORR_STATS:
            scatter = []
            for pd in player_data:
                xv = pd["vals"].get(x_stat)
                yv = pd["vals"].get(y_stat)
                if xv is not None and yv is not None:
                    scatter.append({
                        "name": pd["name"],
                        "pos": pd["pos"],
                        "x": round(xv, 2) if xv else 0,
                        "y": round(yv, 2) if yv else 0,
                    })

        # Stat labels
        labels = {k: v[1] for k, v in _CORR_STATS.items()}

        # Available seasons
        avail = conn.execute(
            "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
        ).fetchall()
        available_seasons = [r[0] for r in avail]

        return {
            "stat_keys": stat_keys,
            "labels": labels,
            "matrix": matrix,
            "top_predictors": ppg_corrs,
            "scatter": scatter,
            "sample_size": len(rows),
            "available_seasons": available_seasons,
        }


def fetch_dynasty_power_rankings(season=None):
    """Rank all 32 NFL teams by total dynasty roster value (sum of player trade values)."""
    with get_db() as conn:
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else 2024

        available_seasons = [
            r[0] for r in conn.execute(
                "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
            ).fetchall()
        ]

        # Get all fantasy-relevant players with PPG for trade value calc
        rows = conn.execute("""
            SELECT
                p.player_id, p.full_name, p.position, p.team, p.age,
                SUM(s.fantasy_points_ppr) as total_ppr,
                COUNT(DISTINCT s.week) as games
            FROM players p
            JOIN player_week_stats s
                ON s.player_id = p.player_id AND s.season = ?
            WHERE p.position IN ('QB','RB','WR','TE')
              AND p.team IS NOT NULL AND p.team != '' AND p.team != 'FA'
            GROUP BY p.player_id
            HAVING games >= 4 AND (total_ppr / games) >= 2.0
            ORDER BY total_ppr DESC
        """, [season]).fetchall()

        # Build per-team data
        teams = {}
        for r in rows:
            pid, name, pos, team, age, total_ppr, games = r
            if not team:
                continue
            ppg = round(total_ppr / games, 2) if games > 0 else 0.0
            tv = compute_trade_value(ppg, age, pos)

            if team not in teams:
                teams[team] = {"team": team, "qb": [], "rb": [], "wr": [], "te": [],
                               "total_value": 0, "players": []}

            player_obj = {
                "player_id": pid,
                "full_name": name or "Unknown",
                "position": pos or "WR",
                "age": age,
                "ppg": ppg,
                "trade_value": tv,
            }
            teams[team]["players"].append(player_obj)
            teams[team]["total_value"] += tv
            group_key = (pos or "WR").lower()
            if group_key in teams[team]:
                teams[team][group_key].append(player_obj)

        # Compute positional group values and top players per team
        result_teams = []
        for t_key, t_data in teams.items():
            qb_val = round(sum(p["trade_value"] for p in t_data["qb"]), 1)
            rb_val = round(sum(p["trade_value"] for p in t_data["rb"]), 1)
            wr_val = round(sum(p["trade_value"] for p in t_data["wr"]), 1)
            te_val = round(sum(p["trade_value"] for p in t_data["te"]), 1)
            total = round(qb_val + rb_val + wr_val + te_val, 1)

            # Top 3 players by trade value
            top3 = sorted(t_data["players"], key=lambda x: x["trade_value"], reverse=True)[:3]

            result_teams.append({
                "team": t_key,
                "total_value": total,
                "qb_value": qb_val,
                "rb_value": rb_val,
                "wr_value": wr_val,
                "te_value": te_val,
                "player_count": len(t_data["players"]),
                "top_players": [{
                    "player_id": p["player_id"],
                    "full_name": p["full_name"],
                    "position": p["position"],
                    "trade_value": p["trade_value"],
                    "ppg": p["ppg"],
                    "age": p["age"],
                } for p in top3],
            })

        result_teams.sort(key=lambda x: x["total_value"], reverse=True)
        for i, t in enumerate(result_teams):
            t["rank"] = i + 1

        # Compute league average for comparison
        avg_value = round(sum(t["total_value"] for t in result_teams) / max(len(result_teams), 1), 1)

        return {
            "season": season,
            "available_seasons": available_seasons,
            "teams": result_teams,
            "league_average": avg_value,
            "total_teams": len(result_teams),
        }
