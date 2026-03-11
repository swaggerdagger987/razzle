"""
live_data.tools -- scoring comparison, cheat sheet, archetypes, draft class,
weekly leaders, pace tracker, streaks, season recap, records, waivers,
playoff schedule, fpts breakdown, garbage time, snap efficiency, handcuffs,
weekly MVP, stacks, positional advantage, TD regression, dual threat,
season pace, target premium, workload monitor, drop rate, success rate,
game script, draft class tracker, featured.
"""

import logging
import math
from collections import defaultdict

from ..db import get_db
from .core import _cached, _CACHE_TTL_STABLE, _current_nfl_season, _current_draft_year, compute_trade_value

logger = logging.getLogger("razzle.live_data.tools")

def fetch_featured():
    """Return 3 curated player lists for home page widgets (cached 5 min)."""
    def _query():
        return _fetch_featured_uncached()
    return _cached("featured", _query)


def _fetch_featured_uncached():
    with get_db() as conn:

        # Get latest season
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        season = row[0] if row and row[0] else _current_nfl_season()

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
            logger.exception("featured: dynasty_risers query failed")
            results["dynasty_risers"] = []

        # 2. Rookie Big Board — top prospects by draft pick
        try:
            row2 = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
            draft_year = row2[0] if row2 and row2[0] else _current_draft_year()

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
            logger.exception("featured: rookie_board query failed")
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
            logger.exception("featured: breakout_candidates query failed")
            results["breakout_candidates"] = []

        results["season"] = season
        return results


def fetch_scoring_comparison(season=None, position=None, limit=40):
    """Compare player rankings across PPR, Half-PPR, and Standard scoring."""
    def _query():
        nonlocal season
        with get_db() as conn:
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

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
                    COALESCE(SUM(s.fantasy_points_half_ppr), SUM(s.fantasy_points_ppr) - 0.5 * SUM(s.receptions)) as total_half,
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
    return _cached(f"scoring_comparison:{season}:{position}:{limit}", _query)


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
    def _query():
        nonlocal season
        with get_db() as conn:
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            # All formats use fantasy_points_ppr as base column.
            # half_ppr column is NULL in the DB, so we compute from PPR:
            #   Half-PPR = PPR - 0.5 * receptions
            #   Standard = PPR - receptions
            pts_col = "fantasy_points_ppr"

            use_std_calc = (fmt == "std")
            use_half_calc = (fmt == "half")

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

                # Compute scoring format from PPR base:
                # Standard = PPR - receptions, Half-PPR = PPR - 0.5 * receptions
                if use_std_calc:
                    total_pts = total_pts - total_rec
                elif use_half_calc:
                    total_pts = total_pts - (0.5 * total_rec)

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
    return _cached(f"cheat_sheet:{season}:{fmt}", _query)

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
    def _query():
        nonlocal season
        with get_db() as conn:
            if not season:
                row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
                season = row[0] if row and row[0] else _current_nfl_season()

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
    return _cached(f"player_archetypes:{season}:{position}", _query, _CACHE_TTL_STABLE)
def fetch_draft_class(draft_year=None, position=None):
    """Return fantasy production stats for players from a given draft class."""
    def _query():
        nonlocal draft_year
        with get_db() as conn:
            available_classes = [
                r[0] for r in conn.execute(
                    "SELECT DISTINCT season FROM draft_picks WHERE season >= 2020 ORDER BY season DESC"
                ).fetchall()
            ]

            if not draft_year:
                # Default to most recent class with stats data
                draft_year = available_classes[0] if available_classes else _current_nfl_season()

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
    return _cached(f"draft_class:{draft_year}:{position}", _query, _CACHE_TTL_STABLE)

def fetch_weekly_leaders(season=None, week=None, position=None, limit=25):
    """Return top fantasy performers for a given week."""
    def _query():
        nonlocal season, week
        with get_db() as conn:
            # Available seasons
            row = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

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
    return _cached(f"weekly_leaders:{season}:{week}:{position}:{limit}", _query)


def fetch_pace_tracker(season=None, position=None, limit=50):
    """Project per-game stats to 17-game season and track milestone progress."""
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()

            if not season:
                cursor.execute("SELECT MAX(season) FROM player_week_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"pace_tracker:{season}:{position}:{limit}", _query)
def fetch_streaks(season=None, position=None, window=4, limit=25):
    """Identify players on hot or cold scoring streaks vs their season average."""
    def _query():
        nonlocal season, window
        with get_db() as conn:
            cursor = conn.cursor()

            if not season:
                cursor.execute("SELECT MAX(season) FROM player_week_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"streaks:{season}:{position}:{window}:{limit}", _query)


def fetch_season_recap(season=None):
    """Generate a data-driven season recap with key storylines."""
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()

            if not season:
                cursor.execute("SELECT MAX(season) FROM player_week_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"season_recap:{season}", _query)
def fetch_records(position=None, limit=10):
    """Return all-time fantasy records: single-game, single-season, career PPG."""
    def _query():
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
    return _cached(f"records:{position}:{limit}", _query, _CACHE_TTL_STABLE)


def fetch_waivers(season=None, position=None, window=4, limit=30):
    """
    Waiver wire targets — players with high recent PPG but low season PPG.
    These are likely unrostered players who have been producing recently.
    Compares recent window PPG vs full season PPG; big positive delta = waiver target.
    """
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()

            # Determine season
            if not season:
                cursor.execute("SELECT MAX(season) FROM player_week_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"waivers:{season}:{position}:{window}:{limit}", _query)


def fetch_playoff_schedule(season=None, position=None, limit=40):
    """
    Playoff schedule planner — grades each player's playoff matchups (weeks 14-17).
    Uses defense PPG-allowed-by-position to rate each week's difficulty.
    Returns players ranked by playoff SOS (easiest first = best playoff schedule).
    """
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()

            if not season:
                cursor.execute("SELECT MAX(season) FROM player_week_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"playoff_schedule:{season}:{position}:{limit}", _query)


def fetch_fpts_breakdown(season=None, position=None, limit=40):
    """
    Fantasy points breakdown — how each player accumulates their PPR points.
    Breaks down total PPR into: rush yards, rec yards, pass yards, receptions, TDs.
    PPR scoring: 0.04 per pass yd, 0.1 per rush/rec yd, 1 per reception,
                 4 per pass TD, 6 per rush/rec TD, -2 per INT.
    """
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()

            if not season:
                cursor.execute("SELECT MAX(season) FROM player_week_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"fpts_breakdown:{season}:{position}:{limit}", _query)


def fetch_garbage_time(season=None, position=None, limit=40):
    """Garbage time detector — identifies stat padders with high garbage-time scoring %."""
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()
            if not season:
                cursor.execute("SELECT MAX(season) FROM player_season_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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

                # Convert 0-1 range to percentage
                gt_pct_display = gt_pct * 100 if gt_pct <= 1 else gt_pct

                players.append({
                    "player_id": pid,
                    "name": name,
                    "position": pos,
                    "team": team,
                    "games": games,
                    "ppg": round(ppg, 1),
                    "garbage_time_pct": round(gt_pct_display, 1),
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
    return _cached(f"garbage_time:{season}:{position}:{limit}", _query)


def fetch_snap_efficiency(season=None, position=None, limit=50):
    """Snap efficiency — fantasy points per snap played."""
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()
            if not season:
                cursor.execute("SELECT MAX(season) FROM player_season_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"snap_efficiency:{season}:{position}:{limit}", _query)


def fetch_handcuffs(season=None, limit=30):
    """
    Handcuff rankings — backup RBs ranked by value.
    For each team, find the #1 RB (most carries) and #2 RB (handcuff).
    Rank handcuffs by team rushing volume and their own efficiency/usage.
    """
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()

            if not season:
                cursor.execute("SELECT MAX(season) FROM player_week_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"handcuffs:{season}:{limit}", _query)


def fetch_weekly_mvp(season=None):
    """
    Weekly MVP grid — the #1 PPR scorer at each position for every week.
    Returns a grid: {weeks: [{week, QB: {name, fpts}, RB: ..., WR: ..., TE: ...}]}
    """
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()

            if not season:
                cursor.execute("SELECT MAX(season) FROM player_week_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"weekly_mvp:{season}", _query)


def fetch_stacks(season=None, limit=30):
    """
    Stack correlation finder — QB + WR/TE same-team scoring correlations.
    Computes Pearson correlation between QB weekly scores and their pass
    catchers' weekly scores (same team). Best stacks = highest correlation.
    """
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()

            if not season:
                cursor.execute("SELECT MAX(season) FROM player_week_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"stacks:{season}:{limit}", _query)


def fetch_positional_advantage(season=None, position=None, limit=40):
    """
    Positional advantage — players who provide the biggest scoring edge
    over the positional average PPG. Distinct from VORP (replacement level).
    """
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()

            if not season:
                cursor.execute("SELECT MAX(season) FROM player_week_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"positional_advantage:{season}:{position}:{limit}", _query)


def fetch_td_regression(season=None, position=None, limit=50):
    """TD regression candidates — expected vs actual TDs based on opportunity volume."""
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()
            if not season:
                cursor.execute("SELECT MAX(season) FROM player_season_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

            pos_filter = ""
            params = [season]
            if position:
                pos_filter = "AND p.position = ?"
                params.append(position)

            cursor.execute(f"""
                SELECT p.gsis_id, p.full_name, p.position, p.team,
                       s.rushing_tds, s.receiving_tds, s.passing_tds,
                       s.carries, s.targets, s.attempts,
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
    return _cached(f"td_regression:{season}:{position}:{limit}", _query)


def fetch_dual_threat(season=None, position=None, limit=50):
    """Dual-threat index — players who contribute in both rushing and receiving."""
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()
            if not season:
                cursor.execute("SELECT MAX(season) FROM player_season_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"dual_threat:{season}:{position}:{limit}", _query)


def fetch_season_pace(season=None, position=None, limit=50):
    """Season pace tracker — projects season totals and milestone tracking."""
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()
            if not season:
                cursor.execute("SELECT MAX(season) FROM player_season_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"season_pace:{season}:{position}:{limit}", _query)


def fetch_target_premium(season=None, position=None, limit=50):
    """Target premium — target quality composite for pass catchers."""
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()
            if not season:
                cursor.execute("SELECT MAX(season) FROM player_season_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

            pos_filter = "AND p.position IN ('WR','TE','RB')"
            params = [season]
            if position and position in ("WR", "TE", "RB"):
                pos_filter = "AND p.position = ?"
                params.append(position)

            cursor.execute(f"""
                SELECT p.gsis_id, p.full_name, p.position, p.team,
                       SUM(w.targets) as tot_targets,
                       SUM(w.receptions) as tot_receptions,
                       SUM(w.receiving_yards) as tot_rec_yards,
                       SUM(w.receiving_air_yards) as tot_air_yards,
                       SUM(w.receiving_yards_after_catch) as tot_yac,
                       COUNT(DISTINCT w.week) as gp
                FROM player_week_stats w
                JOIN players p ON p.gsis_id = w.player_id
                WHERE w.season = ? AND p.fantasy_relevant = 1
                {pos_filter}
                GROUP BY p.gsis_id
                HAVING gp >= 4 AND tot_targets >= 20
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
    return _cached(f"target_premium:{season}:{position}:{limit}", _query)


def fetch_workload_monitor(season=None, position=None, limit=50):
    """Workload monitor — snap counts, touches/game, heavy usage flags."""
    def _query():
        nonlocal season
        with get_db() as conn:
            cursor = conn.cursor()
            if not season:
                cursor.execute("SELECT MAX(season) FROM player_season_stats")
                season = cursor.fetchone()[0] or _current_nfl_season()

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
    return _cached(f"workload_monitor:{season}:{position}:{limit}", _query)


def fetch_drop_rate(season=None, position=None, limit=50):
    """Rank pass catchers by drop rate — sure hands vs butterfingers."""
    def _query():
        nonlocal season
        with get_db() as conn:
            if not season:
                cur = conn.execute("SELECT MAX(season) FROM player_season_pbp")
                season = cur.fetchone()[0] or _current_nfl_season()

            pos_filter = ""
            params = [season]
            if position:
                pos_filter = "AND p.position = ?"
                params.append(position)

            rows = conn.execute(f"""
                SELECT p.player_id, p.full_name, p.position, p.team,
                       pb.drops, pb.drop_rate,
                       SUM(w.targets) as tot_targets,
                       SUM(w.receptions) as tot_recs,
                       SUM(w.receiving_yards) as tot_rec_yds,
                       SUM(w.receiving_yards_after_catch) as tot_yac,
                       COUNT(DISTINCT w.week) as gp
                FROM player_season_pbp pb
                JOIN players p ON p.player_id = pb.player_id
                JOIN player_week_stats w ON w.player_id = pb.player_id AND w.season = pb.season
                    AND w.season_type = 'regular'
                WHERE pb.season = ?
                  AND p.position IN ('WR','TE','RB')
                  AND p.fantasy_relevant = 1
                  AND pb.drops IS NOT NULL
                  {pos_filter}
                GROUP BY p.player_id
                HAVING tot_targets >= 20
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
    return _cached(f"drop_rate:{season}:{position}:{limit}", _query)


def fetch_success_rate(season=None, position=None, limit=50):
    """Rank players by rush/pass success rate from PBP data."""
    def _query():
        nonlocal season
        with get_db() as conn:
            if not season:
                cur = conn.execute("SELECT MAX(season) FROM player_season_pbp")
                season = cur.fetchone()[0] or _current_nfl_season()

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
                    AND w.season_type = 'regular'
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
    return _cached(f"success_rate:{season}:{position}:{limit}", _query)


def fetch_game_script(season=None, position=None, limit=40):
    """Show how game script (avg score diff) correlates with fantasy production."""
    def _query():
        nonlocal season
        with get_db() as conn:
            row = conn.execute("SELECT DISTINCT season FROM player_season_pbp ORDER BY season DESC").fetchall()
            available_seasons = [r[0] for r in row] if row else [_current_nfl_season()]
            if not season:
                season = available_seasons[0] if available_seasons else _current_nfl_season()

            pos_filter = ""
            params = [season]
            if position:
                pos_filter = "AND p.position = ?"
                params.append(position)

            rows = conn.execute(f"""
                SELECT p.player_id, p.full_name, p.position, p.team,
                       pb.avg_score_differential, pb.garbage_time_pct,
                       SUM(w.fantasy_points_ppr) as tot_ppr,
                       COUNT(DISTINCT w.week) as gp
                FROM player_season_pbp pb
                JOIN players p ON p.player_id = pb.player_id
                JOIN player_week_stats w ON w.player_id = pb.player_id AND w.season = pb.season
                    AND w.season_type = 'regular'
                WHERE pb.season = ?
                  AND p.position IN ('QB','RB','WR','TE')
                  AND p.fantasy_relevant = 1
                  AND pb.avg_score_differential IS NOT NULL
                  {pos_filter}
                GROUP BY p.player_id
                HAVING gp >= 4 AND tot_ppr > 0
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
    return _cached(f"game_script:{season}:{position}:{limit}", _query)


# ---------------------------------------------------------------------------
# Draft Class Tracker
# ---------------------------------------------------------------------------

def fetch_draft_class_tracker(draft_year=None, position=None):
    """
    Return drafted players from a given year with career fantasy production
    and hit/miss classification.
    """
    def _query():
        nonlocal draft_year
        with get_db() as conn:
            # Available draft years
            year_rows = conn.execute(
                "SELECT DISTINCT season FROM draft_picks WHERE position IN ('QB','RB','WR','TE') ORDER BY season DESC"
            ).fetchall()
            available_years = [r[0] for r in year_rows] if year_rows else [_current_draft_year()]

            if not draft_year:
                draft_year = available_years[0] if available_years else _current_draft_year()

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
                    classification = "too_early" if (_current_draft_year() - draft_year) <= 2 else "bust"
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
    return _cached(f"draft_class_tracker:{draft_year}:{position}", _query, _CACHE_TTL_STABLE)


