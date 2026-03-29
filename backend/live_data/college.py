"""
College football functions — cfb player stats, analytics, records, awards.
"""

import logging
import math
import re
from collections import defaultdict

from ..db import get_db
from .core import _cached, _CACHE_TTL_STABLE, _current_nfl_season, _enrich_college_derived, TEAM_ABBREV, _efficiency_grade

logger = logging.getLogger("razzle.live_data.college")


def _has_table(conn, table_name):
    """Check if a table exists in the database."""
    return conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,)
    ).fetchone() is not None



def _fetch_college_players_uncached(
    search="",
    position="",
    positions="",
    team="",
    conference="",
    sort_key="total_yards",
    sort_dir="desc",
    limit=200,
    offset=0,
    season=0,
):
    """Return paginated college player stats from cfb_player_season_stats."""
    with get_db() as conn:
        if not _has_table(conn, "cfb_player_season_stats"):
            return {"items": [], "count": 0, "season": season or _current_nfl_season(), "available_seasons": []}

        # Default to latest season
        if not season:
            row = conn.execute("SELECT MAX(season) FROM cfb_player_season_stats").fetchone()
            season = row[0] if row and row[0] else _current_nfl_season()

        # Position list
        pos_list = []
        if positions:
            pos_list = [p.strip().upper() for p in positions.split(",") if p.strip()]
        elif position:
            pos_list = [position.strip().upper()]

        where = ["c.season = ?"]
        params = [season]

        if search:
            search_clean = search.lower().replace(" ", "").replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            where.append("LOWER(REPLACE(c.player_name, ' ', '')) LIKE ? ESCAPE '\\'")
            params.append(f"%{search_clean}%")

        if pos_list:
            placeholders = ",".join("?" * len(pos_list))
            where.append(f"c.position IN ({placeholders})")
            params.extend(pos_list)

        if team:
            team_clean = team.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            where.append("c.team LIKE ? ESCAPE '\\'")
            params.append(f"%{team_clean}%")

        if conference:
            conf_clean = conference.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            where.append("c.conference LIKE ? ESCAPE '\\'")
            params.append(f"%{conf_clean}%")

        where_clause = " AND ".join(where)

        # Safe sort columns
        safe_sorts = {
            "player_name": "c.player_name",
            "position": "c.position",
            "team": "c.team",
            "conference": "c.conference",
            "games": "c.games",
            "completions": "c.completions",
            "pass_attempts": "c.pass_attempts",
            "pass_yards": "c.pass_yards",
            "pass_tds": "c.pass_tds",
            "ints_thrown": "c.ints_thrown",
            "carries": "c.carries",
            "rush_yards": "c.rush_yards",
            "rush_tds": "c.rush_tds",
            "receptions": "c.receptions",
            "targets": "c.targets",
            "rec_yards": "c.rec_yards",
            "rec_tds": "c.rec_tds",
            "fumbles": "c.fumbles",
            "total_tds": "c.total_tds",
            "total_yards": "c.total_yards",
        }
        # Derived sorts handled in Python
        derived_sorts = {"completion_pct", "yards_per_carry", "yards_per_rec",
                         "yards_per_target", "catch_rate", "yards_per_att",
                         "pass_ypg", "rush_ypg", "rec_ypg", "total_ypg", "tds_per_game"}

        is_derived_sort = sort_key in derived_sorts
        order_expr = safe_sorts.get(sort_key, "c.total_yards")
        if sort_dir.lower() not in ("asc", "desc"):
            sort_dir = "desc"

        # NULLS LAST
        nulls_clause = ""
        if not is_derived_sort and sort_key not in ("player_name", "position", "team", "conference"):
            nulls_clause = f"CASE WHEN {order_expr} IS NULL THEN 1 ELSE 0 END,"

        # For derived sorts, fetch extra rows and sort in Python
        fetch_limit = limit * 3 if is_derived_sort else limit
        fetch_offset = 0 if is_derived_sort else offset

        query = f"""
            SELECT
                c.player_id, c.player_name, c.position, c.team, c.conference, c.season,
                c.games, c.completions, c.pass_attempts, c.pass_yards, c.pass_tds,
                c.ints_thrown, c.sacks_taken, c.carries, c.rush_yards, c.rush_tds,
                c.receptions, c.targets, c.rec_yards, c.rec_tds,
                c.fumbles, c.total_tds, c.total_yards
            FROM cfb_player_season_stats c
            WHERE {where_clause}
            ORDER BY {nulls_clause} {order_expr} {sort_dir}
            LIMIT ? OFFSET ?
        """
        params.extend([fetch_limit, fetch_offset])

        rows = conn.execute(query, params).fetchall()

        # Count
        count_params = params[:-2]
        total = conn.execute(f"""
            SELECT COUNT(*) FROM cfb_player_season_stats c WHERE {where_clause}
        """, count_params).fetchone()[0]

        items = [dict(r) for r in rows]
        items = _enrich_college_derived(items)

        # Python re-sort for derived metrics
        if is_derived_sort:
            reverse = sort_dir.lower() == "desc"
            items.sort(key=lambda x: (x.get(sort_key) is None, -(x.get(sort_key) or 0) if reverse else (x.get(sort_key) or 0)))
            items = items[offset:offset + limit]

        return {"count": total, "season": season, "items": items}



def fetch_college_players(search="", position="", positions="", team="", conference="", sort_key="total_yards", sort_dir="desc", limit=200, offset=0, season=0):
    return _cached(f"fetch_college_players:{search}:{position}:{positions}:{team}:{conference}:{sort_key}:{sort_dir}:{limit}:{offset}:{season}", lambda: _fetch_college_players_uncached(search=search, position=position, positions=positions, team=team, conference=conference, sort_key=sort_key, sort_dir=sort_dir, limit=limit, offset=offset, season=season))

def _fetch_college_player_profile_uncached(player_id):
    """Return a rich college player profile with all seasons + combine/draft data."""
    with get_db() as conn:
        if not _has_table(conn, "cfb_player_season_stats"):
            return {"player": None, "seasons": [], "combine": None, "draft": None}
        # Get all seasons for this player
        seasons = conn.execute("""
            SELECT player_id, player_name, position, team, conference, season,
                   games, completions, pass_attempts, pass_yards, pass_tds,
                   ints_thrown, sacks_taken, carries, rush_yards, rush_tds,
                   receptions, targets, rec_yards, rec_tds,
                   fumbles, total_tds, total_yards
            FROM cfb_player_season_stats
            WHERE player_id = ?
            ORDER BY season ASC
        """, (player_id,)).fetchall()

        if not seasons:
            return {"player": None, "seasons": [], "combine": None, "draft": None}

        season_items = [dict(r) for r in seasons]
        season_items = _enrich_college_derived(season_items)

        # Player bio from most recent season
        latest = season_items[-1]
        player = {
            "player_id": latest["player_id"],
            "player_name": latest["player_name"],
            "position": latest["position"],
            "team": latest["team"],
            "conference": latest["conference"],
            "seasons_played": len(season_items),
        }

        # Career totals
        career = {
            "games": sum(s.get("games") or 0 for s in season_items),
            "completions": sum(s.get("completions") or 0 for s in season_items),
            "pass_attempts": sum(s.get("pass_attempts") or 0 for s in season_items),
            "pass_yards": sum(s.get("pass_yards") or 0 for s in season_items),
            "pass_tds": sum(s.get("pass_tds") or 0 for s in season_items),
            "ints_thrown": sum(s.get("ints_thrown") or 0 for s in season_items),
            "carries": sum(s.get("carries") or 0 for s in season_items),
            "rush_yards": sum(s.get("rush_yards") or 0 for s in season_items),
            "rush_tds": sum(s.get("rush_tds") or 0 for s in season_items),
            "receptions": sum(s.get("receptions") or 0 for s in season_items),
            "targets": sum(s.get("targets") or 0 for s in season_items),
            "rec_yards": sum(s.get("rec_yards") or 0 for s in season_items),
            "rec_tds": sum(s.get("rec_tds") or 0 for s in season_items),
            "total_tds": sum(s.get("total_tds") or 0 for s in season_items),
            "total_yards": sum(s.get("total_yards") or 0 for s in season_items),
        }
        # Derive career efficiency
        career = _enrich_college_derived([career])[0]

        # Normalize name: strip all non-alpha chars (matches adapter logic)
        name_alpha = re.sub(r"[^a-z]", "", latest["player_name"].lower())
        name_nospace = latest["player_name"].lower().replace(" ", "")

        # Try to match with combine data (try space-stripped first, then alpha-only)
        combine_row = None
        try:
            combine_row = conn.execute("""
                SELECT player_name, position, school, draft_year,
                       height_inches, weight,
                       forty, bench, vertical, broad_jump, cone, shuttle,
                       draft_team, draft_round, draft_pick, pfr_id
                FROM combine_data
                WHERE LOWER(REPLACE(player_name, ' ', '')) = ?
                ORDER BY draft_year DESC LIMIT 1
            """, (name_nospace,)).fetchone()

            # Fallback: broader match for names with apostrophes/hyphens
            if not combine_row:
                candidates = conn.execute("""
                    SELECT player_name, position, school, draft_year,
                           height_inches, weight,
                           forty, bench, vertical, broad_jump, cone, shuttle,
                           draft_team, draft_round, draft_pick, pfr_id
                    FROM combine_data
                    WHERE LOWER(REPLACE(REPLACE(REPLACE(player_name, ' ', ''), '''', ''), '-', '')) = ?
                    ORDER BY draft_year DESC LIMIT 1
                """, (name_alpha,)).fetchone()
                if candidates:
                    combine_row = candidates
        except Exception:
            pass  # combine_data table may not exist

        combine = None
        if combine_row:
            combine = dict(combine_row)
            ht = combine.get("height_inches")
            if ht:
                combine["height_display"] = f"{ht // 12}'{ht % 12}\""
            dt = (combine.get("draft_team") or "").upper()
            combine["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)

        # Try to match with draft picks
        draft_row = None
        try:
            draft_row = conn.execute("""
                SELECT player_name, position, college, season as draft_year,
                       round, pick, team as nfl_team,
                       career_av, games as nfl_games, allpro, probowls,
                       pass_yards as nfl_pass_yards, pass_tds as nfl_pass_tds,
                       rush_yards as nfl_rush_yards, rush_tds as nfl_rush_tds,
                       rec_yards as nfl_rec_yards, rec_tds as nfl_rec_tds,
                       receptions as nfl_receptions
                FROM draft_picks
                WHERE LOWER(REPLACE(player_name, ' ', '')) = ?
                ORDER BY season DESC LIMIT 1
            """, (name_nospace,)).fetchone()

            if not draft_row:
                draft_row = conn.execute("""
                    SELECT player_name, position, college, season as draft_year,
                           round, pick, team as nfl_team,
                           career_av, games as nfl_games, allpro, probowls,
                           pass_yards as nfl_pass_yards, pass_tds as nfl_pass_tds,
                           rush_yards as nfl_rush_yards, rush_tds as nfl_rush_tds,
                           rec_yards as nfl_rec_yards, rec_tds as nfl_rec_tds,
                           receptions as nfl_receptions
                    FROM draft_picks
                    WHERE LOWER(REPLACE(REPLACE(REPLACE(player_name, ' ', ''), '''', ''), '-', '')) = ?
                    ORDER BY season DESC LIMIT 1
            """, (name_alpha,)).fetchone()
        except Exception:
            pass  # draft_picks table may not exist

        draft = dict(draft_row) if draft_row else None

        return {
            "player": player,
            "seasons": season_items,
            "career": career,
            "combine": combine,
            "draft": draft,
        }



def fetch_college_player_profile(player_id):
    return _cached(f"fetch_college_player_profile:{player_id}", lambda: _fetch_college_player_profile_uncached(player_id=player_id))

def _fetch_college_filter_options_uncached():
    """Return available filter values for the college screener."""
    with get_db() as conn:
        if not _has_table(conn, "cfb_player_season_stats"):
            return {"seasons": [], "teams": [], "conferences": [], "positions": []}

        seasons = [r[0] for r in conn.execute(
            "SELECT DISTINCT season FROM cfb_player_season_stats ORDER BY season DESC"
        ).fetchall()]

        teams = [r[0] for r in conn.execute(
            "SELECT DISTINCT team FROM cfb_player_season_stats WHERE team IS NOT NULL AND team != '' ORDER BY team"
        ).fetchall()]

        conferences = [r[0] for r in conn.execute(
            "SELECT DISTINCT conference FROM cfb_player_season_stats WHERE conference IS NOT NULL AND conference != '' ORDER BY conference"
        ).fetchall()]

        positions = [r[0] for r in conn.execute(
            "SELECT DISTINCT position FROM cfb_player_season_stats WHERE position IN ('QB','RB','WR','TE','FB','ATH') ORDER BY position"
        ).fetchall()]

        return {"seasons": seasons, "teams": teams, "conferences": conferences, "positions": positions}


# ---------------------------------------------------------------------------
# College analytical endpoints
# ---------------------------------------------------------------------------

_CFB_POSITIONS = {"QB", "RB", "WR", "TE", "FB", "ATH"}

_CFB_BREAKOUT_ANNOTATIONS = [
    "production hasn't caught up to usage yet",
    "volume says breakout is coming",
    "the workload is there, points will follow",
    "opportunity is knocking",
    "college breakout candidate",
    "usage trending up faster than production",
    "more touches than his stats suggest",
    "the next big thing?",
    "keep an eye on this name",
    "draft stock rising",
]



def fetch_college_filter_options():
    return _cached("fetch_college_filter_options", lambda: _fetch_college_filter_options_uncached())

def _cfb_available_seasons(conn):
    """Return list of available college seasons, descending."""
    rows = conn.execute(
        "SELECT DISTINCT season FROM cfb_player_season_stats ORDER BY season DESC"
    ).fetchall()
    return [r[0] for r in rows] if rows else [_current_nfl_season()]


def _cfb_pos_filter(position, prefix="c"):
    """Return (sql_fragment, params) for college position filtering."""
    if position and position.upper() in _CFB_POSITIONS:
        return f"AND {prefix}.position = ?", [position.upper()]
    return "", []


def _fetch_college_breakouts_uncached(season=None, position=None, limit=50):
    """College breakout candidates: high opportunity, lower production (gap = upside)."""
    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        pos_sql, pos_params = _cfb_pos_filter(position)

        query = f"""
            SELECT
                c.player_id, c.player_name, c.position, c.team, c.conference,
                c.season, c.games,
                c.carries, c.rush_yards, c.rush_tds,
                c.targets, c.receptions, c.rec_yards, c.rec_tds,
                c.pass_attempts, c.pass_yards, c.pass_tds,
                c.total_yards, c.total_tds
            FROM cfb_player_season_stats c
            WHERE c.season = ?
              AND c.position IN ('QB','RB','WR','TE','ATH')
              AND c.games >= 4
              {pos_sql}
            ORDER BY c.total_yards DESC
            LIMIT 500
        """
        rows = conn.execute(query, [season] + pos_params).fetchall()

        if not rows:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "candidates": [],
                "total": 0,
            }

        players = []
        for r in rows:
            d = dict(r)
            g = d["games"] or 1
            carries = d["carries"] or 0
            targets = d["targets"] or 0
            receptions = d["receptions"] or 0
            rush_yards = d["rush_yards"] or 0
            rec_yards = d["rec_yards"] or 0
            pass_attempts = d["pass_attempts"] or 0
            total_yards = d["total_yards"] or 0
            total_tds = d["total_tds"] or 0

            # Per-game metrics
            carries_pg = round(carries / g, 1)
            targets_pg = round(targets / g, 1)
            yards_pg = round(total_yards / g, 1)
            tds_pg = round(total_tds / g, 2)
            att_pg = round(pass_attempts / g, 1)

            players.append({
                "player_id": d["player_id"],
                "name": d["player_name"] or "Unknown",
                "position": d["position"] or "ATH",
                "team": d["team"] or "",
                "conference": d["conference"] or "",
                "games": g,
                "carries_per_game": carries_pg,
                "targets_per_game": targets_pg,
                "attempts_per_game": att_pg,
                "yards_per_game": yards_pg,
                "tds_per_game": tds_pg,
                "total_yards": total_yards,
                "total_tds": total_tds,
            })

        # Compute breakout score within each position group
        by_pos = {}
        for p in players:
            pos = p["position"]
            by_pos.setdefault(pos, []).append(p)

        for pos, pos_players in by_pos.items():
            n = len(pos_players)
            if n < 2:
                for p in pos_players:
                    p["opportunity_pct"] = 50
                    p["production_pct"] = 50
                    p["breakout_score"] = 0
                continue

            # Opportunity: usage volume (touches + targets for skill, attempts for QB)
            for p in pos_players:
                if pos == "QB":
                    p["_opp"] = p["carries_per_game"] * 1.0 + p["attempts_per_game"] * 1.5
                else:
                    p["_opp"] = p["carries_per_game"] * 2.0 + p["targets_per_game"] * 3.0

            opp_sorted = sorted(pos_players, key=lambda x: x["_opp"])
            for i, p in enumerate(opp_sorted):
                p["opportunity_pct"] = round((i / (n - 1)) * 100) if n > 1 else 50

            ypg_sorted = sorted(pos_players, key=lambda x: x["yards_per_game"])
            for i, p in enumerate(ypg_sorted):
                p["production_pct"] = round((i / (n - 1)) * 100) if n > 1 else 50

            for p in pos_players:
                gap = p["opportunity_pct"] - p["production_pct"]
                p["breakout_score"] = max(0, gap)
                del p["_opp"]

        all_players = []
        for pp in by_pos.values():
            all_players.extend(pp)

        all_players.sort(key=lambda x: x["breakout_score"], reverse=True)
        candidates = all_players[:limit]

        for i, p in enumerate(candidates):
            p["rank"] = i + 1
            p["annotation"] = _CFB_BREAKOUT_ANNOTATIONS[i % len(_CFB_BREAKOUT_ANNOTATIONS)]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "candidates": candidates,
            "total": len(candidates),
        }


_CFB_EFFICIENCY_ANNOTATIONS = [
    "elite efficiency", "doing more with less", "hyper-efficient producer",
    "best bang for the usage", "premium per-touch value",
    "every touch counts", "quality over quantity", "efficiency machine",
    "elite production rate", "model of efficiency",
]

_CFB_VOLUME_ANNOTATIONS = [
    "workhorse usage", "bell cow workload", "volume king",
    "fed early and often", "carries the offense",
    "target hog", "highest usage rate", "touches galore",
    "the whole offense runs through him", "feature back territory",
]



def fetch_college_breakouts(season=None, position=None, limit=50):
    return _cached(f"fetch_college_breakouts:{season}:{position}:{limit}", lambda: _fetch_college_breakouts_uncached(season=season, position=position, limit=limit))

def _fetch_college_efficiency_uncached(season=None, position=None, limit=30):
    """College efficiency rankings: points per opportunity and volume leaders."""
    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        pos_sql, pos_params = _cfb_pos_filter(position)

        query = f"""
            SELECT
                c.player_id, c.player_name, c.position, c.team, c.conference,
                c.games,
                c.carries, c.rush_yards, c.rush_tds,
                c.targets, c.receptions, c.rec_yards, c.rec_tds,
                c.pass_attempts, c.pass_yards, c.pass_tds,
                c.total_yards, c.total_tds, c.fumbles
            FROM cfb_player_season_stats c
            WHERE c.season = ?
              AND c.position IN ('QB','RB','WR','TE','ATH')
              AND c.games >= 4
              {pos_sql}
            ORDER BY c.total_yards DESC
            LIMIT 500
        """
        rows = conn.execute(query, [season] + pos_params).fetchall()

        if not rows:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "most_efficient": [],
                "volume_kings": [],
            }

        players = []
        for r in rows:
            d = dict(r)
            g = d["games"] or 1
            carries = d["carries"] or 0
            targets = d["targets"] or 0
            receptions = d["receptions"] or 0
            rush_yards = d["rush_yards"] or 0
            rec_yards = d["rec_yards"] or 0
            total_yards = d["total_yards"] or 0
            total_tds = d["total_tds"] or 0

            pos = d["position"] or "ATH"
            pass_attempts = d.get("pass_attempts") or 0
            opportunities = (pass_attempts + carries) if pos == "QB" else (carries + targets)
            touches = carries + receptions
            opp_min = {"QB": 30, "RB": 25, "WR": 20, "TE": 15}.get(pos, 25)
            if opportunities < opp_min:
                continue

            # Approximate fantasy points (standard college scoring: 0.1 yd, 6 TD, 1 rec PPR)
            approx_fpts = (rush_yards + rec_yards) * 0.1 + total_tds * 6 + receptions * 1.0 + (d["pass_yards"] or 0) * 0.04 + (d["pass_tds"] or 0) * 4
            ppg = round(approx_fpts / g, 2)
            ppo = round(approx_fpts / opportunities, 2) if opportunities > 0 else 0
            ypt = round(total_yards / touches, 2) if touches > 0 else 0
            catch_rate = round(receptions / targets * 100, 1) if targets > 0 else 0
            ypc = round(rush_yards / carries, 1) if carries > 0 else 0
            td_rate = round(total_tds / touches * 100, 1) if touches > 0 else 0

            players.append({
                "player_id": d["player_id"],
                "name": d["player_name"] or "Unknown",
                "position": d["position"] or "ATH",
                "team": d["team"] or "",
                "conference": d["conference"] or "",
                "games": g,
                "ppg": ppg,
                "opportunities": opportunities,
                "touches": touches,
                "ppo": ppo,
                "yards_per_touch": ypt,
                "yards_per_carry": ypc,
                "catch_rate": catch_rate,
                "td_rate": td_rate,
                "total_tds": total_tds,
            })

        # PPO percentile for grades
        ppo_values = sorted([p["ppo"] for p in players])
        n = len(ppo_values)
        for p in players:
            if n == 0:
                p["grade"] = "C"
                continue
            rank = sum(1 for v in ppo_values if v < p["ppo"])
            percentile = rank / n * 100
            p["grade"] = _efficiency_grade(percentile)

        most_efficient = sorted(players, key=lambda x: x["ppo"], reverse=True)[:limit]
        for i, p in enumerate(most_efficient):
            p["annotation"] = _CFB_EFFICIENCY_ANNOTATIONS[i % len(_CFB_EFFICIENCY_ANNOTATIONS)]

        volume_kings = sorted(players, key=lambda x: x["opportunities"], reverse=True)[:limit]
        for i, p in enumerate(volume_kings):
            p["annotation"] = _CFB_VOLUME_ANNOTATIONS[i % len(_CFB_VOLUME_ANNOTATIONS)]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "most_efficient": most_efficient,
            "volume_kings": volume_kings,
        }


# College stat leader categories: (key, label, sql_expr, min_threshold_col, min_threshold_val, positions)
_CFB_LEADER_CATEGORIES = [
    ("total_yards", "Total Yards", "c.total_yards", None, 0, None),
    ("total_tds", "Total Touchdowns", "c.total_tds", None, 0, None),
    ("pass_yards", "Passing Yards", "c.pass_yards", None, 0, {"QB"}),
    ("pass_tds", "Passing TDs", "c.pass_tds", None, 0, {"QB"}),
    ("rush_yards", "Rushing Yards", "c.rush_yards", None, 0, {"QB", "RB", "ATH"}),
    ("rush_tds", "Rushing TDs", "c.rush_tds", None, 0, {"QB", "RB", "ATH"}),
    ("rec_yards", "Receiving Yards", "c.rec_yards", None, 0, {"WR", "TE", "RB"}),
    ("rec_tds", "Receiving TDs", "c.rec_tds", None, 0, {"WR", "TE", "RB"}),
    ("receptions", "Receptions", "c.receptions", None, 0, {"WR", "TE", "RB"}),
    ("yards_per_carry", "Yards Per Carry", "CAST(c.rush_yards AS REAL) / NULLIF(c.carries, 0)", "c.carries", 30, {"QB", "RB", "ATH"}),
    ("completion_pct", "Completion %", "CAST(c.completions AS REAL) * 100.0 / NULLIF(c.pass_attempts, 0)", "c.pass_attempts", 50, {"QB"}),
    ("catch_rate", "Catch Rate", "CAST(c.receptions AS REAL) * 100.0 / NULLIF(c.targets, 0)", "c.targets", 20, {"WR", "TE", "RB"}),
]



def fetch_college_efficiency(season=None, position=None, limit=30):
    return _cached(f"fetch_college_efficiency:{season}:{position}:{limit}", lambda: _fetch_college_efficiency_uncached(season=season, position=position, limit=limit))

def _fetch_college_leaders_uncached(season=None, position=None, limit=10):
    """Return top college players in each stat category."""
    limit = max(1, min(25, limit))
    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        pos_upper = position.strip().upper() if position else None
        if pos_upper and pos_upper not in _CFB_POSITIONS:
            pos_upper = None

        categories = []
        for key, label, sql_expr, min_col, min_val, positions in _CFB_LEADER_CATEGORIES:
            if pos_upper and positions and pos_upper not in positions:
                continue

            pos_params = []
            if pos_upper:
                pos_where = "AND c.position = ?"
                pos_params = [pos_upper]
            elif positions:
                placeholders = ",".join("?" for _ in positions)
                pos_where = f"AND c.position IN ({placeholders})"
                pos_params = list(positions)
            else:
                pos_where = "AND c.position IN ('QB','RB','WR','TE','ATH')"

            having = "HAVING c.games >= 3"
            if min_col and min_val:
                having += f" AND {min_col} >= {int(min_val)}"

            query = f"""
                SELECT
                    c.player_id, c.player_name, c.position, c.team, c.conference,
                    c.games,
                    {sql_expr} as stat_value
                FROM cfb_player_season_stats c
                WHERE c.season = ?
                  {pos_where}
                GROUP BY c.player_id
                {having}
                ORDER BY stat_value DESC
                LIMIT ?
            """
            rows = conn.execute(query, [season] + pos_params + [limit]).fetchall()

            leaders = []
            for r in rows:
                val = r["stat_value"]
                if val is None:
                    continue
                is_rate = key in ("yards_per_carry", "completion_pct", "catch_rate")
                display_val = round(val, 1) if is_rate else int(round(val))
                display_str = f"{display_val}%" if key in ("completion_pct", "catch_rate") else str(display_val)

                leaders.append({
                    "player_id": r["player_id"],
                    "name": r["player_name"] or "Unknown",
                    "position": r["position"] or "ATH",
                    "team": r["team"] or "",
                    "conference": r["conference"] or "",
                    "stat_value": display_val,
                    "stat_display": display_str,
                    "games": r["games"],
                })

            categories.append({
                "key": key,
                "label": label,
                "leaders": leaders,
            })

        return {
            "categories": categories,
            "season": season,
            "available_seasons": available_seasons,
        }



def fetch_college_leaders(season=None, position=None, limit=10):
    return _cached(f"fetch_college_leaders:{season}:{position}:{limit}", lambda: _fetch_college_leaders_uncached(season=season, position=position, limit=limit))

def _fetch_college_trends_uncached(season=None, position=None, limit=30):
    """College year-over-year trends: players whose production rose or fell vs prior season."""
    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        prior_season = season - 1
        if prior_season not in available_seasons:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "risers": [],
                "fallers": [],
            }

        pos_sql, pos_params = _cfb_pos_filter(position, "curr")

        query = f"""
            SELECT
                curr.player_id, curr.player_name, curr.position,
                curr.team, curr.conference,
                curr.games as curr_games, curr.total_yards as curr_yards,
                curr.total_tds as curr_tds,
                curr.rush_yards as curr_rush, curr.rec_yards as curr_rec,
                prev.games as prev_games, prev.total_yards as prev_yards,
                prev.total_tds as prev_tds,
                prev.rush_yards as prev_rush, prev.rec_yards as prev_rec
            FROM cfb_player_season_stats curr
            JOIN cfb_player_season_stats prev
                ON curr.player_id = prev.player_id AND prev.season = ?
            WHERE curr.season = ?
              AND curr.games >= 3
              AND prev.games >= 3
              AND curr.position IN ('QB','RB','WR','TE','ATH')
              {pos_sql}
            ORDER BY curr.total_yards DESC
            LIMIT 500
        """
        rows = conn.execute(query, [prior_season, season] + pos_params).fetchall()

        risers = []
        fallers = []
        for r in rows:
            d = dict(r)
            curr_g = d["curr_games"] or 1
            prev_g = d["prev_games"] or 1
            curr_ypg = round((d["curr_yards"] or 0) / curr_g, 1)
            prev_ypg = round((d["prev_yards"] or 0) / prev_g, 1)
            delta_ypg = round(curr_ypg - prev_ypg, 1)
            delta_pct = round((delta_ypg / prev_ypg) * 100, 1) if prev_ypg > 0 else 0

            curr_tpg = round((d["curr_tds"] or 0) / curr_g, 2)
            prev_tpg = round((d["prev_tds"] or 0) / prev_g, 2)

            entry = {
                "player_id": d["player_id"],
                "name": d["player_name"] or "Unknown",
                "position": d["position"] or "ATH",
                "team": d["team"] or "",
                "conference": d["conference"] or "",
                "curr_ypg": curr_ypg,
                "prev_ypg": prev_ypg,
                "delta_ypg": delta_ypg,
                "delta_pct": delta_pct,
                "curr_tds_pg": curr_tpg,
                "prev_tds_pg": prev_tpg,
                "curr_games": d["curr_games"],
                "prev_games": d["prev_games"],
            }

            if delta_ypg > 0:
                risers.append(entry)
            else:
                fallers.append(entry)

        risers.sort(key=lambda x: x["delta_ypg"], reverse=True)
        fallers.sort(key=lambda x: x["delta_ypg"])

        return {
            "season": season,
            "prior_season": prior_season,
            "available_seasons": available_seasons,
            "risers": risers[:limit],
            "fallers": fallers[:limit],
        }



def fetch_college_trends(season=None, position=None, limit=30):
    return _cached(f"fetch_college_trends:{season}:{position}:{limit}", lambda: _fetch_college_trends_uncached(season=season, position=position, limit=limit))

def _fetch_college_rankings_uncached(season=None, position=None, limit=50):
    """College production rankings: top producers by approximate fantasy points."""
    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        pos_sql, pos_params = _cfb_pos_filter(position)

        query = f"""
            SELECT
                c.player_id, c.player_name, c.position, c.team, c.conference,
                c.games,
                c.carries, c.rush_yards, c.rush_tds,
                c.targets, c.receptions, c.rec_yards, c.rec_tds,
                c.pass_attempts, c.completions, c.pass_yards, c.pass_tds,
                c.ints_thrown, c.fumbles,
                c.total_yards, c.total_tds
            FROM cfb_player_season_stats c
            WHERE c.season = ?
              AND c.position IN ('QB','RB','WR','TE','ATH')
              AND c.games >= 3
              {pos_sql}
            ORDER BY c.total_yards DESC
            LIMIT 500
        """
        rows = conn.execute(query, [season] + pos_params).fetchall()

        players = []
        for r in rows:
            d = dict(r)
            g = d["games"] or 1
            rush_yd = d["rush_yards"] or 0
            rec_yd = d["rec_yards"] or 0
            pass_yd = d["pass_yards"] or 0
            receptions = d["receptions"] or 0
            total_tds = d["total_tds"] or 0
            pass_tds = d["pass_tds"] or 0

            # Approximate fantasy points
            fpts = (rush_yd + rec_yd) * 0.1 + total_tds * 6 + receptions * 1.0 + pass_yd * 0.04 + pass_tds * 4
            ppg = round(fpts / g, 1)

            players.append({
                "player_id": d["player_id"],
                "name": d["player_name"] or "Unknown",
                "position": d["position"] or "ATH",
                "team": d["team"] or "",
                "conference": d["conference"] or "",
                "games": g,
                "ppg": ppg,
                "total_fpts": round(fpts, 1),
                "total_yards": d["total_yards"] or 0,
                "total_tds": total_tds,
                "rush_yards": rush_yd,
                "rec_yards": rec_yd,
                "pass_yards": pass_yd,
                "receptions": receptions,
                "carries": d["carries"] or 0,
            })

        # Assign tiers based on PPG percentile
        players.sort(key=lambda x: x["ppg"], reverse=True)
        n = len(players)
        tier_labels = ["Elite", "Star", "Starter", "Contributor", "Depth", "Roster"]
        tier_thresholds = [0.05, 0.15, 0.35, 0.60, 0.80]
        for i, p in enumerate(players):
            pct = i / n if n > 0 else 1
            tier = tier_labels[-1]
            for t_idx, thresh in enumerate(tier_thresholds):
                if pct < thresh:
                    tier = tier_labels[t_idx]
                    break
            p["tier"] = tier
            p["rank"] = i + 1

        return {
            "season": season,
            "available_seasons": available_seasons,
            "players": players[:limit],
            "total": n,
        }



def fetch_college_rankings(season=None, position=None, limit=50):
    return _cached(f"fetch_college_rankings:{season}:{position}:{limit}", lambda: _fetch_college_rankings_uncached(season=season, position=position, limit=limit))

def _fetch_college_streaks_uncached(season=None, position=None, limit=25):
    """College momentum: players with multi-season production growth or decline."""
    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        pos_sql, pos_params = _cfb_pos_filter(position, "c")

        # Get players with at least 2 seasons of data up to current season
        query = f"""
            SELECT
                c.player_id, c.player_name, c.position, c.team, c.conference,
                c.season, c.games, c.total_yards, c.total_tds,
                c.rush_yards, c.rec_yards, c.pass_yards
            FROM cfb_player_season_stats c
            WHERE c.season <= ?
              AND c.season >= ? - 3
              AND c.position IN ('QB','RB','WR','TE','ATH')
              AND c.games >= 3
              {pos_sql}
            ORDER BY c.player_id, c.season
        """
        rows = conn.execute(query, [season, season] + pos_params).fetchall()

        # Group by player
        by_player = {}
        for r in rows:
            d = dict(r)
            pid = d["player_id"]
            by_player.setdefault(pid, []).append(d)

        hot = []
        cold = []
        for pid, seasons_data in by_player.items():
            if len(seasons_data) < 2:
                continue

            # Sort by season ascending
            seasons_data.sort(key=lambda x: x["season"])
            latest = seasons_data[-1]
            prev = seasons_data[-2]

            # Must include current season
            if latest["season"] != season:
                continue

            g_curr = latest["games"] or 1
            g_prev = prev["games"] or 1
            curr_ypg = (latest["total_yards"] or 0) / g_curr
            prev_ypg = (prev["total_yards"] or 0) / g_prev
            delta = round(curr_ypg - prev_ypg, 1)
            delta_pct = round((delta / prev_ypg) * 100, 1) if prev_ypg > 10 else 0

            # Per-game scores for sparkline-like data
            season_ypg = [round((s["total_yards"] or 0) / (s["games"] or 1), 1) for s in seasons_data]

            entry = {
                "player_id": pid,
                "name": latest["player_name"] or "Unknown",
                "position": latest["position"] or "ATH",
                "team": latest["team"] or "",
                "conference": latest["conference"] or "",
                "games": latest["games"],
                "curr_ypg": round(curr_ypg, 1),
                "prev_ypg": round(prev_ypg, 1),
                "delta": delta,
                "delta_pct": delta_pct,
                "season_ypg": season_ypg,
                "seasons_played": len(seasons_data),
            }

            if delta > 0:
                hot.append(entry)
            else:
                cold.append(entry)

        hot.sort(key=lambda x: x["delta"], reverse=True)
        cold.sort(key=lambda x: x["delta"])

        return {
            "season": season,
            "available_seasons": available_seasons,
            "hot": hot[:limit],
            "cold": cold[:limit],
        }


# ---------------------------------------------------------------------------
# College Stock Watch
# ---------------------------------------------------------------------------

_CFB_RISING_ANNOTATIONS = [
    "under the radar", "breakout incoming", "hidden gem",
    "efficiency darling", "undervalued producer", "sleeper alert",
    "doing more with less", "quiet dominance", "sneaky good",
    "watch this one",
]

_CFB_FALLING_ANNOTATIONS = [
    "regression candidate", "volume-inflated", "overrated production",
    "declining trajectory", "diminishing returns", "fading fast",
    "inefficient usage", "past the peak", "stat padding",
    "buyer beware",
]



def fetch_college_streaks(season=None, position=None, limit=25):
    return _cached(f"fetch_college_streaks:{season}:{position}:{limit}", lambda: _fetch_college_streaks_uncached(season=season, position=position, limit=limit))

def _fetch_college_stock_watch_uncached(season=None, position=None, limit=30):
    """College stock watch: efficiency vs production gap.
    Uses per-game yards efficiency and YPC/YPR to identify over/undervalued."""
    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        pos_sql, pos_params = _cfb_pos_filter(position)

        query = f"""
            SELECT
                c.player_id, c.player_name, c.position, c.team, c.conference,
                c.season, c.games,
                c.carries, c.rush_yards, c.rush_tds,
                c.targets, c.receptions, c.rec_yards, c.rec_tds,
                c.pass_attempts, c.completions, c.pass_yards, c.pass_tds,
                c.total_yards, c.total_tds
            FROM cfb_player_season_stats c
            WHERE c.season = ?
              AND c.position IN ('QB','RB','WR','TE','ATH')
              AND c.games >= 4
              {pos_sql}
            ORDER BY c.total_yards DESC
            LIMIT 500
        """
        rows = conn.execute(query, [season] + pos_params).fetchall()

        if not rows:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "rising": [],
                "falling": [],
            }

        players = []
        for r in rows:
            d = dict(r)
            g = d["games"] or 1
            rush_yd = d["rush_yards"] or 0
            rec_yd = d["rec_yards"] or 0
            pass_yd = d["pass_yards"] or 0
            receptions = d["receptions"] or 0
            carries = d["carries"] or 0
            total_tds = d["total_tds"] or 0
            pass_tds = d["pass_tds"] or 0
            targets = d["targets"] or 0

            # Approximate fantasy points
            fpts = (rush_yd + rec_yd) * 0.1 + total_tds * 6 + receptions * 1.0 + pass_yd * 0.04 + pass_tds * 4
            ppg = round(fpts / g, 1)
            if ppg < 2:
                continue

            # Efficiency: points per opportunity (QB uses pass_attempts + carries)
            col_pos = d["position"] or "ATH"
            if col_pos == "QB":
                opportunities = (d["pass_attempts"] or 0) + carries
            else:
                opportunities = carries + targets
            col_opp_min = {"QB": 25, "RB": 20, "WR": 15, "TE": 10}.get(col_pos, 20)
            ppo = round(fpts / opportunities, 2) if opportunities > col_opp_min else None

            # Yards per touch
            touches = carries + receptions
            ypt = round((rush_yd + rec_yd) / touches, 1) if touches > 10 else None

            players.append({
                "player_id": d["player_id"],
                "name": d["player_name"] or "Unknown",
                "position": d["position"] or "ATH",
                "team": d["team"] or "",
                "conference": d["conference"] or "",
                "games": g,
                "ppg": ppg,
                "ppo": ppo,
                "ypt": ypt,
            })

        if not players:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "rising": [],
                "falling": [],
            }

        # Percentile rankings
        ppg_sorted = sorted([p["ppg"] for p in players])
        n_total = len(ppg_sorted)
        ppo_vals = sorted([p["ppo"] for p in players if p["ppo"] is not None])
        n_ppo = len(ppo_vals)
        ypt_vals = sorted([p["ypt"] for p in players if p["ypt"] is not None])
        n_ypt = len(ypt_vals)

        def pct_rank(val, sorted_vals, count):
            if count == 0:
                return 50
            rank = sum(1 for v in sorted_vals if v < val)
            return round(rank / count * 100, 1)

        def grade_from_pct(pct):
            if pct >= 95:
                return "A+"
            if pct >= 85:
                return "A"
            if pct >= 75:
                return "B+"
            if pct >= 65:
                return "B"
            if pct >= 50:
                return "C+"
            if pct >= 35:
                return "C"
            if pct >= 25:
                return "D"
            return "F"

        for p in players:
            ppg_pct = pct_rank(p["ppg"], ppg_sorted, n_total)
            ppo_pct = pct_rank(p["ppo"], ppo_vals, n_ppo) if p["ppo"] is not None else 50
            ypt_pct = pct_rank(p["ypt"], ypt_vals, n_ypt) if p["ypt"] is not None else 50

            # Stock score: efficiency-weighted (no SOS/consistency for college)
            stock_score = round(ppo_pct * 0.35 + ypt_pct * 0.30 + ppg_pct * 0.35)
            p["stock_score"] = stock_score
            p["efficiency_grade"] = grade_from_pct(ppo_pct)
            p["consistency_grade"] = grade_from_pct(ypt_pct)
            p["sos_grade"] = grade_from_pct(ppg_pct)
            p["stock_delta"] = stock_score - round(ppg_pct)

        rising = sorted(
            [p for p in players if p["stock_delta"] > 0],
            key=lambda x: x["stock_delta"], reverse=True,
        )[:limit]
        for i, p in enumerate(rising):
            p["annotation"] = _CFB_RISING_ANNOTATIONS[i % len(_CFB_RISING_ANNOTATIONS)]

        falling = sorted(
            [p for p in players if p["stock_delta"] < 0],
            key=lambda x: x["stock_delta"],
        )[:limit]
        for i, p in enumerate(falling):
            p["annotation"] = _CFB_FALLING_ANNOTATIONS[i % len(_CFB_FALLING_ANNOTATIONS)]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "rising": rising,
            "falling": falling,
        }


# ---------------------------------------------------------------------------
# College Positional Scarcity
# ---------------------------------------------------------------------------

_CFB_SCARCITY_TIERS = {
    "QB": [
        {"label": "Elite", "start": 1, "end": 5},
        {"label": "Starter", "start": 6, "end": 15},
        {"label": "Depth", "start": 16, "end": 30},
    ],
    "RB": [
        {"label": "Bellcow", "start": 1, "end": 8},
        {"label": "Committee", "start": 9, "end": 20},
        {"label": "Depth", "start": 21, "end": 40},
    ],
    "WR": [
        {"label": "Alpha", "start": 1, "end": 10},
        {"label": "Starter", "start": 11, "end": 25},
        {"label": "Depth", "start": 26, "end": 40},
    ],
    "TE": [
        {"label": "Unicorn", "start": 1, "end": 5},
        {"label": "Starter", "start": 6, "end": 12},
        {"label": "Depth", "start": 13, "end": 20},
    ],
}

_CFB_SCARCITY_ANNOTATIONS = {
    "QB": {5: "elite tier ends", 15: "starter cutoff"},
    "RB": {8: "bellcow tier ends", 20: "committee cutoff"},
    "WR": {10: "alpha tier ends", 25: "starter cutoff"},
    "TE": {5: "unicorn tier ends", 12: "starter cutoff"},
}



def fetch_college_stock_watch(season=None, position=None, limit=30):
    return _cached(f"fetch_college_stock_watch:{season}:{position}:{limit}", lambda: _fetch_college_stock_watch_uncached(season=season, position=position, limit=limit))

def _fetch_college_scarcity_uncached(season=None):
    """College positional scarcity: PPG drop-off by position using approx fantasy points."""
    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        positions_data = {}
        for pos in ("QB", "RB", "WR", "TE"):
            pos_limit = 40 if pos in ("RB", "WR") else 30 if pos == "QB" else 20
            query = """
                SELECT
                    c.player_id, c.player_name, c.position, c.team, c.conference,
                    c.games,
                    c.carries, c.rush_yards, c.rush_tds,
                    c.targets, c.receptions, c.rec_yards, c.rec_tds,
                    c.pass_attempts, c.pass_yards, c.pass_tds,
                    c.total_yards, c.total_tds
                FROM cfb_player_season_stats c
                WHERE c.season = ?
                  AND c.position = ?
                  AND c.games >= 4
                ORDER BY c.total_yards DESC
                LIMIT ?
            """
            rows = conn.execute(query, [season, pos, pos_limit * 3]).fetchall()

            players = []
            for r in rows:
                d = dict(r)
                g = d["games"] or 1
                rush_yd = d["rush_yards"] or 0
                rec_yd = d["rec_yards"] or 0
                pass_yd = d["pass_yards"] or 0
                receptions = d["receptions"] or 0
                total_tds = d["total_tds"] or 0
                pass_tds = d["pass_tds"] or 0

                fpts = (rush_yd + rec_yd) * 0.1 + total_tds * 6 + receptions * 1.0 + pass_yd * 0.04 + pass_tds * 4
                ppg = round(fpts / g, 1)
                players.append({
                    "player_id": d["player_id"],
                    "name": d["player_name"] or "Unknown",
                    "team": d["team"] or "",
                    "conference": d["conference"] or "",
                    "games": g,
                    "ppg": ppg,
                })

            players.sort(key=lambda x: x["ppg"], reverse=True)
            players = players[:pos_limit]
            for i, p in enumerate(players):
                p["rank"] = i + 1

            top_ppg = players[0]["ppg"] if players else 0
            rep_rank = 10 if pos in ("QB", "TE") else 20
            rep_ppg = players[rep_rank - 1]["ppg"] if len(players) >= rep_rank else 0
            drop_off = round(top_ppg - rep_ppg, 1)

            tier_breaks = []
            for tb in _CFB_SCARCITY_TIERS.get(pos, []):
                end_rank = tb["end"]
                ppg_at = players[end_rank - 1]["ppg"] if len(players) >= end_rank else 0
                annotation = _CFB_SCARCITY_ANNOTATIONS.get(pos, {}).get(end_rank, "")
                tier_breaks.append({
                    "label": tb["label"],
                    "start": tb["start"],
                    "end": end_rank,
                    "ppg_at_break": ppg_at,
                    "annotation": annotation,
                })

            positions_data[pos] = {
                "players": players,
                "top_ppg": top_ppg,
                "replacement_ppg": rep_ppg,
                "replacement_rank": rep_rank,
                "drop_off": drop_off,
                "tier_breaks": tier_breaks,
            }

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



def fetch_college_scarcity(season=None):
    return _cached(f"fetch_college_scarcity:{season}", lambda: _fetch_college_scarcity_uncached(season=season))

def _fetch_college_consistency_uncached(season=None, position=None, limit=30):
    """College consistency: cross-season per-game stat variance for multi-year players."""


    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        pos_sql, pos_params = _cfb_pos_filter(position)

        # Get all seasons for players who played in the requested season
        query = f"""
            SELECT c.player_id, c.player_name, c.position, c.team, c.conference,
                   c.season, c.games,
                   c.carries, c.rush_yards, c.rush_tds,
                   c.receptions, c.rec_yards, c.rec_tds,
                   c.pass_yards, c.pass_tds, c.total_yards, c.total_tds
            FROM cfb_player_season_stats c
            WHERE c.player_id IN (
                SELECT player_id FROM cfb_player_season_stats
                WHERE season = ? AND games >= 4
                  AND position IN ('QB','RB','WR','TE','ATH')
                  {pos_sql}
            )
            AND c.games >= 4
            AND c.position IN ('QB','RB','WR','TE','ATH')
            ORDER BY c.player_id, c.season
        """
        rows = conn.execute(query, [season] + pos_params).fetchall()
        if not rows:
            return {"season": season, "available_seasons": available_seasons,
                    "rock_solid": [], "wild_cards": []}


        player_seasons = defaultdict(list)
        player_info = {}
        for r in rows:
            d = dict(r)
            pid = d["player_id"]
            g = d["games"] or 1
            rec = d["receptions"] or 0
            rush_yd = d["rush_yards"] or 0
            rec_yd = d["rec_yards"] or 0
            total_tds = d["total_tds"] or 0
            pass_yd = d["pass_yards"] or 0
            pass_tds = d["pass_tds"] or 0
            fpts = (rush_yd + rec_yd) * 0.1 + total_tds * 6 + rec * 1.0 + pass_yd * 0.04 + pass_tds * 4
            ppg = fpts / g
            player_seasons[pid].append({"season": d["season"], "ppg": round(ppg, 2), "games": g})
            if d["season"] == season:
                player_info[pid] = {
                    "player_id": pid,
                    "name": d["player_name"] or "Unknown",
                    "position": d["position"] or "ATH",
                    "team": d["team"] or "",
                    "conference": d["conference"] or "",
                }

        players = []
        for pid, seasons_data in player_seasons.items():
            if pid not in player_info:
                continue
            ppg_values = [s["ppg"] for s in seasons_data]
            n = len(ppg_values)
            if n == 0:
                continue
            total_games = sum(s["games"] for s in seasons_data)
            mean = sum(ppg_values) / n
            if mean < 2:
                continue

            if n >= 2:
                variance = sum((v - mean) ** 2 for v in ppg_values) / (n - 1)
                stddev = math.sqrt(variance)
            else:
                stddev = 0.0
            cov = round(stddev / mean, 3) if mean > 0 else 0

            sorted_ppg = sorted(ppg_values)
            floor_val = sorted_ppg[0]
            ceil_val = sorted_ppg[-1]

            players.append({
                **player_info[pid],
                "ppg": round(mean, 2),
                "stddev": round(stddev, 2),
                "cov": cov,
                "floor": floor_val,
                "ceiling": ceil_val,
                "range": round(ceil_val - floor_val, 1),
                "games": total_games,
                "seasons": n,
            })

        cov_values = sorted([p["cov"] for p in players])
        total = len(cov_values)
        for p in players:
            if total == 0:
                p["grade"] = "C"
                continue
            rank = sum(1 for v in cov_values if v > p["cov"])
            percentile = rank / total * 100
            p["grade"] = _efficiency_grade(percentile)

        rock_solid = sorted(players, key=lambda x: x["cov"])[:limit]
        wild_cards = sorted(players, key=lambda x: x["cov"], reverse=True)[:limit]

        return {
            "season": season,
            "available_seasons": available_seasons,
            "rock_solid": rock_solid,
            "wild_cards": wild_cards,
        }



def fetch_college_consistency(season=None, position=None, limit=30):
    return _cached(f"fetch_college_consistency:{season}:{position}:{limit}", lambda: _fetch_college_consistency_uncached(season=season, position=position, limit=limit))

def _fetch_college_workload_uncached(season=None, position=None, limit=50):
    """College workload monitor: touches/game, carries, targets (no snap data)."""
    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        pos_sql, pos_params = _cfb_pos_filter(position)

        query = f"""
            SELECT c.player_id, c.player_name, c.position, c.team, c.conference,
                   c.games, c.carries, c.rush_yards, c.rush_tds,
                   c.targets, c.receptions, c.rec_yards, c.rec_tds,
                   c.pass_attempts, c.pass_yards, c.pass_tds,
                   c.total_yards, c.total_tds
            FROM cfb_player_season_stats c
            WHERE c.season = ?
              AND c.position IN ('QB','RB','WR','TE','ATH')
              AND c.games >= 4
              {pos_sql}
            ORDER BY c.total_yards DESC
            LIMIT 500
        """
        rows = conn.execute(query, [season] + pos_params).fetchall()
        if not rows:
            return {"players": [], "season": season, "available_seasons": available_seasons, "count": 0}

        players = []
        for r in rows:
            d = dict(r)
            g = d["games"] or 1
            carries = d["carries"] or 0
            targets = d["targets"] or 0
            recs = d["receptions"] or 0
            rush_yd = d["rush_yards"] or 0
            rec_yd = d["rec_yards"] or 0

            touches = carries + recs
            touches_pg = touches / g
            carries_pg = carries / g
            targets_pg = targets / g
            total_yd_pg = (rush_yd + rec_yd) / g

            if touches_pg < 3:
                continue

            flags = []
            pos = d["position"] or "ATH"
            if pos in ("RB",) and touches_pg >= 18:
                flags.append("bell cow")
            if pos in ("RB",) and touches_pg >= 22:
                flags.append("extreme volume")
            if pos in ("WR", "TE") and targets_pg >= 8:
                flags.append("target monster")
            if touches_pg >= 20:
                flags.append("workhorse")

            workload_score = touches_pg * 4 + total_yd_pg * 0.1

            players.append({
                "player_id": d["player_id"],
                "name": d["player_name"] or "Unknown",
                "position": pos,
                "team": d["team"] or "",
                "conference": d["conference"] or "",
                "games": g,
                "touches_pg": round(touches_pg, 1),
                "carries_pg": round(carries_pg, 1),
                "targets_pg": round(targets_pg, 1),
                "total_yd_pg": round(total_yd_pg, 1),
                "workload": round(workload_score, 0),
                "snaps_pg": None,
                "snap_pct": None,
                "flags": flags,
            })

        players.sort(key=lambda x: x["workload"], reverse=True)
        players = players[:limit]

        return {
            "players": players,
            "season": season,
            "available_seasons": available_seasons,
            "count": len(players),
        }



def fetch_college_workload(season=None, position=None, limit=50):
    return _cached(f"fetch_college_workload:{season}:{position}:{limit}", lambda: _fetch_college_workload_uncached(season=season, position=position, limit=limit))

def _fetch_college_dual_threat_uncached(season=None, position=None, limit=50):
    """College dual-threat index: rush + receiving versatility."""


    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        pos_sql, pos_params = _cfb_pos_filter(position)

        query = f"""
            SELECT c.player_id, c.player_name, c.position, c.team, c.conference,
                   c.games, c.carries, c.rush_yards, c.rush_tds,
                   c.receptions, c.rec_yards, c.rec_tds,
                   c.total_yards, c.total_tds
            FROM cfb_player_season_stats c
            WHERE c.season = ?
              AND c.position IN ('QB','RB','WR','TE','ATH')
              AND c.games >= 4
              {pos_sql}
            ORDER BY c.total_yards DESC
            LIMIT 500
        """
        rows = conn.execute(query, [season] + pos_params).fetchall()
        if not rows:
            return {"players": [], "season": season, "available_seasons": available_seasons, "count": 0}

        players = []
        for r in rows:
            d = dict(r)
            g = d["games"] or 1
            rush_yd = d["rush_yards"] or 0
            rec_yd = d["rec_yards"] or 0
            carries = d["carries"] or 0
            recs = d["receptions"] or 0
            rush_td = d["rush_tds"] or 0
            rec_td = d["rec_tds"] or 0

            if rush_yd < 50 and rec_yd < 50:
                continue

            rush_yd_pg = rush_yd / g
            rec_yd_pg = rec_yd / g
            total_yd_pg = rush_yd_pg + rec_yd_pg
            carries_pg = carries / g
            rec_pg = recs / g

            rush_comp = max(rush_yd_pg, 0.1)
            rec_comp = max(rec_yd_pg, 0.1)
            dti = math.sqrt(rush_comp * rec_comp)

            total = rush_yd + rec_yd
            rush_pct = (rush_yd / total * 100) if total > 0 else 50
            rec_pct = 100 - rush_pct

            players.append({
                "player_id": d["player_id"],
                "name": d["player_name"] or "Unknown",
                "position": d["position"] or "ATH",
                "team": d["team"] or "",
                "conference": d["conference"] or "",
                "games": g,
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
            "available_seasons": available_seasons,
            "count": len(players),
        }



def fetch_college_dual_threat(season=None, position=None, limit=50):
    return _cached(f"fetch_college_dual_threat:{season}:{position}:{limit}", lambda: _fetch_college_dual_threat_uncached(season=season, position=position, limit=limit))

def _fetch_college_snap_efficiency_uncached(season=None, position=None, limit=50):
    """College touch efficiency: fantasy points per touch (no snap data available)."""
    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        pos_sql, pos_params = _cfb_pos_filter(position)

        query = f"""
            SELECT c.player_id, c.player_name, c.position, c.team, c.conference,
                   c.games, c.carries, c.rush_yards, c.rush_tds,
                   c.receptions, c.targets, c.rec_yards, c.rec_tds,
                   c.pass_yards, c.pass_tds, c.total_yards, c.total_tds
            FROM cfb_player_season_stats c
            WHERE c.season = ?
              AND c.position IN ('QB','RB','WR','TE','ATH')
              AND c.games >= 4
              {pos_sql}
            ORDER BY c.total_yards DESC
            LIMIT 500
        """
        rows = conn.execute(query, [season] + pos_params).fetchall()
        if not rows:
            return {"players": [], "season": season, "available_seasons": available_seasons, "count": 0}

        players = []
        for r in rows:
            d = dict(r)
            g = d["games"] or 1
            carries = d["carries"] or 0
            recs = d["receptions"] or 0
            rush_yd = d["rush_yards"] or 0
            rec_yd = d["rec_yards"] or 0
            total_tds = d["total_tds"] or 0
            pass_yd = d["pass_yards"] or 0
            pass_tds = d["pass_tds"] or 0

            touches = carries + recs
            if touches < 20:
                continue

            fpts = (rush_yd + rec_yd) * 0.1 + total_tds * 6 + recs * 1.0 + pass_yd * 0.04 + pass_tds * 4
            ppg = fpts / g
            touches_pg = touches / g
            pts_per_touch = fpts / touches if touches > 0 else 0

            players.append({
                "player_id": d["player_id"],
                "name": d["player_name"] or "Unknown",
                "position": d["position"] or "ATH",
                "team": d["team"] or "",
                "conference": d["conference"] or "",
                "games": g,
                "total_ppr": round(fpts, 1),
                "ppg": round(ppg, 1),
                "snaps": touches,
                "snaps_pg": round(touches_pg, 1),
                "pts_per_snap": round(pts_per_touch, 2),
            })

        players.sort(key=lambda x: x["pts_per_snap"], reverse=True)
        players = players[:limit]

        return {
            "players": players,
            "season": season,
            "available_seasons": available_seasons,
            "count": len(players),
        }



def fetch_college_snap_efficiency(season=None, position=None, limit=50):
    return _cached(f"fetch_college_snap_efficiency:{season}:{position}:{limit}", lambda: _fetch_college_snap_efficiency_uncached(season=season, position=position, limit=limit))

def _fetch_college_aging_curves_uncached(position=None):
    """College production curves by experience year (1st through 5th+ season).

    Returns average total YPG at each college experience level, plus individual
    player arcs for the top producers.
    """
    with get_db() as conn:
        available_seasons = _cfb_available_seasons(conn)
        pos_upper = position.strip().upper() if position else None
        if pos_upper and pos_upper not in _CFB_POSITIONS:
            pos_upper = None

        pos_where = ""
        pos_params: list = []
        if pos_upper:
            pos_where = "AND c.position = ?"
            pos_params = [pos_upper]
        else:
            pos_where = "AND c.position IN ('QB','RB','WR','TE')"

        # For each player, rank their seasons chronologically to get experience year
        # Only include players with >= 2 seasons (needed for curves)
        query = f"""
            SELECT c.player_id, c.player_name, c.position, c.team, c.conference,
                   c.season, c.games, c.total_yards, c.total_tds,
                   c.rush_yards, c.rec_yards, c.pass_yards, c.carries,
                   c.receptions, c.pass_tds
            FROM cfb_player_season_stats c
            WHERE c.games >= 3
              {pos_where}
              AND c.player_id IN (
                  SELECT player_id FROM cfb_player_season_stats
                  WHERE games >= 3
                  GROUP BY player_id HAVING COUNT(*) >= 2
              )
            ORDER BY c.player_id, c.season
        """
        rows = conn.execute(query, pos_params).fetchall()

        # Group by player, assign experience year

        player_seasons: dict = {}
        for r in rows:
            d = dict(r)
            pid = d["player_id"]
            if pid not in player_seasons:
                player_seasons[pid] = []
            player_seasons[pid].append(d)

        # Build curve data: average YPG by experience year
        exp_buckets: dict = defaultdict(list)  # exp_year -> [ypg values]
        player_arcs: list = []

        for pid, seasons in player_seasons.items():
            seasons.sort(key=lambda x: x["season"])
            arc_points = []
            total_career_yards = 0
            for i, s in enumerate(seasons):
                exp_year = i + 1  # 1st year, 2nd year, etc.
                g = s["games"] or 1
                ypg = round((s["total_yards"] or 0) / g, 1)
                total_career_yards += s["total_yards"] or 0
                exp_buckets[exp_year].append(ypg)
                arc_points.append({
                    "exp_year": exp_year,
                    "season": s["season"],
                    "ypg": ypg,
                    "games": g,
                })

            if len(seasons) >= 2:
                player_arcs.append({
                    "player_id": pid,
                    "name": seasons[-1]["player_name"] or "Unknown",
                    "position": seasons[-1]["position"] or "ATH",
                    "team": seasons[-1]["team"] or "",
                    "conference": seasons[-1]["conference"] or "",
                    "career_yards": total_career_yards,
                    "seasons_played": len(seasons),
                    "points": arc_points,
                })

        # Build curve: average at each experience year
        curve = []
        peak_year = None
        peak_ypg = 0
        for exp_year in sorted(exp_buckets.keys()):
            if exp_year > 6:
                break
            vals = exp_buckets[exp_year]
            avg_ypg = round(sum(vals) / len(vals), 1) if vals else 0
            curve.append({
                "age": exp_year,  # reuse "age" field for chart compat
                "ppg": avg_ypg,   # reuse "ppg" field (actually YPG)
                "sample_size": len(vals),
            })
            if avg_ypg > peak_ypg:
                peak_ypg = avg_ypg
                peak_year = exp_year

        # Top 10 player arcs by career yards
        player_arcs.sort(key=lambda x: x["career_yards"], reverse=True)
        top_arcs = player_arcs[:10]

        # Decline start: first year after peak where avg drops 10%+
        decline_start = None
        for pt in curve:
            if peak_year and pt["age"] > peak_year and pt["ppg"] < peak_ypg * 0.9:
                decline_start = pt["age"]
                break

        return {
            "curve": curve,
            "peak": {"age": peak_year, "ppg": peak_ypg},
            "decline_start": decline_start,
            "sample_size": sum(len(v) for v in exp_buckets.values()),
            "players": top_arcs,
            "position": pos_upper or "ALL",
            "available_seasons": available_seasons,
            "x_label": "Experience Year",
            "y_label": "Total YPG",
        }


# ---------------------------------------------------------------------------
# College Records & History endpoints
# ---------------------------------------------------------------------------



def fetch_college_aging_curves(position=None):
    return _cached(f"fetch_college_aging_curves:{position}", lambda: _fetch_college_aging_curves_uncached(position=position))

def _fetch_college_records_uncached(position=None, limit=10):
    """College fantasy record book: single-season and career leaders."""
    with get_db() as conn:
        pos_filter = ""
        params_base = []
        if position and position.upper() in ("QB", "RB", "WR", "TE", "ATH", "FB"):
            pos_filter = " AND c.position = ?"
            params_base = [position.upper()]

        # 1. Single-season records (highest approx fantasy points in one season)
        cursor = conn.cursor()
        cursor.execute(f"""
            SELECT c.player_id, c.player_name, c.position, c.team, c.conference,
                   c.season, c.games,
                   (COALESCE(c.rush_yards, 0) + COALESCE(c.rec_yards, 0)) * 0.1
                   + COALESCE(c.total_tds, 0) * 6
                   + COALESCE(c.receptions, 0) * 1.0
                   + COALESCE(c.pass_yards, 0) * 0.04
                   + COALESCE(c.pass_tds, 0) * 4 as fpts
            FROM cfb_player_season_stats c
            WHERE c.games >= 3 {pos_filter}
            ORDER BY fpts DESC
            LIMIT ?
        """, params_base + [limit])
        single_season = []
        for r in cursor.fetchall():
            games = r[6] or 1
            fpts = r[7] or 0
            single_season.append({
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "ATH", "team": r[3] or "",
                "conference": r[4] or "", "season": r[5],
                "games": games, "total_fpts": round(fpts, 1),
                "ppg": round(fpts / games, 1),
            })

        # 2. Single-season yards (highest total yards)
        cursor.execute(f"""
            SELECT c.player_id, c.player_name, c.position, c.team, c.conference,
                   c.season, c.games,
                   COALESCE(c.rush_yards, 0) + COALESCE(c.rec_yards, 0) + COALESCE(c.pass_yards, 0) as total_yards
            FROM cfb_player_season_stats c
            WHERE c.games >= 3 {pos_filter}
            ORDER BY total_yards DESC
            LIMIT ?
        """, params_base + [limit])
        season_yards = []
        for r in cursor.fetchall():
            games = r[6] or 1
            season_yards.append({
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "ATH", "team": r[3] or "",
                "conference": r[4] or "", "season": r[5],
                "games": games, "total_yards": r[7] or 0,
                "ypg": round((r[7] or 0) / games, 1),
            })

        # 3. Single-season TDs
        cursor.execute(f"""
            SELECT c.player_id, c.player_name, c.position, c.team, c.conference,
                   c.season, c.games, COALESCE(c.total_tds, 0) as tds
            FROM cfb_player_season_stats c
            WHERE c.games >= 3 {pos_filter}
            ORDER BY tds DESC
            LIMIT ?
        """, params_base + [limit])
        season_tds = []
        for r in cursor.fetchall():
            season_tds.append({
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "ATH", "team": r[3] or "",
                "conference": r[4] or "", "season": r[5],
                "games": r[6] or 1, "tds": r[7] or 0,
            })

        # 4. Career leaders (multi-season totals, min 2 seasons)
        cursor.execute(f"""
            SELECT c.player_id, c.player_name, c.position,
                   GROUP_CONCAT(DISTINCT c.team) as teams,
                   GROUP_CONCAT(DISTINCT c.conference) as confs,
                   COUNT(DISTINCT c.season) as seasons_played,
                   SUM(c.games) as total_games,
                   SUM(
                       (COALESCE(c.rush_yards, 0) + COALESCE(c.rec_yards, 0)) * 0.1
                       + COALESCE(c.total_tds, 0) * 6
                       + COALESCE(c.receptions, 0) * 1.0
                       + COALESCE(c.pass_yards, 0) * 0.04
                       + COALESCE(c.pass_tds, 0) * 4
                   ) as career_fpts,
                   MIN(c.season) as first_season,
                   MAX(c.season) as last_season
            FROM cfb_player_season_stats c
            WHERE c.games >= 3 {pos_filter}
            GROUP BY c.player_id
            HAVING seasons_played >= 2
            ORDER BY career_fpts DESC
            LIMIT ?
        """, params_base + [limit])
        career_fpts = []
        for r in cursor.fetchall():
            games = r[6] or 1
            total = r[7] or 0
            career_fpts.append({
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "ATH", "team": r[3] or "",
                "conference": r[4] or "",
                "seasons_played": r[5], "games": games,
                "total_fpts": round(total, 1),
                "ppg": round(total / games, 1),
                "seasons": f"{r[8]}-{r[9]}",
            })

        # 5. Career yards leaders
        cursor.execute(f"""
            SELECT c.player_id, c.player_name, c.position,
                   GROUP_CONCAT(DISTINCT c.team) as teams,
                   GROUP_CONCAT(DISTINCT c.conference) as confs,
                   COUNT(DISTINCT c.season) as seasons_played,
                   SUM(c.games) as total_games,
                   SUM(COALESCE(c.rush_yards, 0) + COALESCE(c.rec_yards, 0) + COALESCE(c.pass_yards, 0)) as career_yards,
                   MIN(c.season) as first_season,
                   MAX(c.season) as last_season
            FROM cfb_player_season_stats c
            WHERE c.games >= 3 {pos_filter}
            GROUP BY c.player_id
            HAVING seasons_played >= 2
            ORDER BY career_yards DESC
            LIMIT ?
        """, params_base + [limit])
        career_yards = []
        for r in cursor.fetchall():
            games = r[6] or 1
            career_yards.append({
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "ATH", "team": r[3] or "",
                "conference": r[4] or "",
                "seasons_played": r[5], "games": games,
                "total_yards": r[7] or 0,
                "ypg": round((r[7] or 0) / games, 1),
                "seasons": f"{r[8]}-{r[9]}",
            })

        return {
            "single_season": single_season,
            "season_yards": season_yards,
            "season_tds": season_tds,
            "career_fpts": career_fpts,
            "career_yards": career_yards,
        }



def fetch_college_records(position=None, limit=10):
    return _cached(f"fetch_college_records:{position}:{limit}", lambda: _fetch_college_records_uncached(position=position, limit=limit))

def _fetch_college_season_recap_uncached(season=None):
    """College season recap with MVP, position leaders, breakouts."""
    with get_db() as conn:
        cursor = conn.cursor()

        if not season:
            cursor.execute("SELECT MAX(season) FROM cfb_player_season_stats")
            row = cursor.fetchone()
            season = row[0] if row else _current_nfl_season()

        cursor.execute("SELECT DISTINCT season FROM cfb_player_season_stats ORDER BY season DESC")
        available_seasons = [r[0] for r in cursor.fetchall()]

        # Season totals with approx fantasy points
        cursor.execute("""
            SELECT c.player_id, c.player_name, c.position, c.team, c.conference,
                   c.games,
                   (COALESCE(c.rush_yards, 0) + COALESCE(c.rec_yards, 0)) * 0.1
                   + COALESCE(c.total_tds, 0) * 6
                   + COALESCE(c.receptions, 0) * 1.0
                   + COALESCE(c.pass_yards, 0) * 0.04
                   + COALESCE(c.pass_tds, 0) * 4 as fpts,
                   COALESCE(c.rush_yards, 0) + COALESCE(c.rec_yards, 0) + COALESCE(c.pass_yards, 0) as total_yards,
                   COALESCE(c.total_tds, 0) as tds
            FROM cfb_player_season_stats c
            WHERE c.season = ? AND c.games >= 3
            ORDER BY fpts DESC
        """, (season,))
        season_rows = cursor.fetchall()

        if not season_rows:
            return {
                "season": season,
                "available_seasons": available_seasons,
                "overall_1": None,
                "pos_leaders": {},
                "top_yards": [],
                "top_tds": [],
                "breakouts": [],
                "busts": [],
                "empty": True,
            }

        def player_dict(r, rank=None):
            games = r[5] or 1
            fpts = r[6] or 0
            d = {
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "ATH", "team": r[3] or "",
                "conference": r[4] or "",
                "games": games, "total_fpts": round(fpts, 1),
                "ppg": round(fpts / games, 1),
                "total_yards": r[7] or 0, "tds": r[8] or 0,
            }
            if rank is not None:
                d["rank"] = rank
            return d

        # 1. Overall MVP
        overall_1 = player_dict(season_rows[0], 1)

        # 2. Top per position
        pos_leaders = {}
        for r in season_rows:
            pos = r[2] or "ATH"
            if pos not in pos_leaders:
                pos_leaders[pos] = player_dict(r, 1)

        # 3. Top 5 by total yards
        top_yards = []
        yards_sorted = sorted(season_rows, key=lambda r: r[7] or 0, reverse=True)[:5]
        for r in yards_sorted:
            d = player_dict(r)
            top_yards.append(d)

        # 4. Top 5 by TDs
        tds_sorted = sorted(season_rows, key=lambda r: r[8] or 0, reverse=True)[:5]
        top_tds = [player_dict(r) for r in tds_sorted]

        # 5. Biggest YoY breakouts
        prev_season = season - 1
        cursor.execute("""
            SELECT c.player_id, c.player_name, c.position, c.team, c.conference,
                   c.games,
                   (COALESCE(c.rush_yards, 0) + COALESCE(c.rec_yards, 0)) * 0.1
                   + COALESCE(c.total_tds, 0) * 6
                   + COALESCE(c.receptions, 0) * 1.0
                   + COALESCE(c.pass_yards, 0) * 0.04
                   + COALESCE(c.pass_tds, 0) * 4 as fpts
            FROM cfb_player_season_stats c
            WHERE c.season = ? AND c.games >= 3
        """, (prev_season,))
        prev_map = {}
        for r in cursor.fetchall():
            games = r[5] or 1
            prev_map[r[0]] = round((r[6] or 0) / games, 1)

        breakouts = []
        for r in season_rows[:200]:
            pid = r[0]
            if pid in prev_map:
                games = r[5] or 1
                curr_ppg = round((r[6] or 0) / games, 1)
                prev_ppg = prev_map[pid]
                if prev_ppg > 0:
                    delta = curr_ppg - prev_ppg
                    if delta > 2:
                        d = player_dict(r)
                        d["prev_ppg"] = prev_ppg
                        d["delta_ppg"] = round(delta, 1)
                        breakouts.append(d)
        breakouts.sort(key=lambda x: x["delta_ppg"], reverse=True)

        # 6. Biggest busts (YoY decline)
        busts = []
        for r in season_rows[:200]:
            pid = r[0]
            if pid in prev_map:
                games = r[5] or 1
                curr_ppg = round((r[6] or 0) / games, 1)
                prev_ppg = prev_map[pid]
                if prev_ppg > 5:
                    delta = curr_ppg - prev_ppg
                    if delta < -2:
                        d = player_dict(r)
                        d["prev_ppg"] = prev_ppg
                        d["delta_ppg"] = round(delta, 1)
                        busts.append(d)
        busts.sort(key=lambda x: x["delta_ppg"])

        return {
            "season": season,
            "available_seasons": available_seasons,
            "overall_1": overall_1,
            "pos_leaders": pos_leaders,
            "top_yards": top_yards,
            "top_tds": top_tds,
            "breakouts": breakouts[:5],
            "busts": busts[:5],
        }



def fetch_college_season_recap(season=None):
    return _cached(f"fetch_college_season_recap:{season}", lambda: _fetch_college_season_recap_uncached(season=season))

def _fetch_college_season_awards_uncached(season=None, position=None):
    """College fantasy season superlatives — simplified awards using season-level data."""
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT DISTINCT season FROM cfb_player_season_stats ORDER BY season DESC")
        available_seasons = [r[0] for r in cursor.fetchall()]
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        pos_filter = ""
        params = [season]
        if position and position.upper() in ("QB", "RB", "WR", "TE", "ATH", "FB"):
            pos_filter = "AND c.position = ?"
            params.append(position.upper())

        cursor.execute(f"""
            SELECT c.player_id, c.player_name, c.position, c.team, c.conference,
                   c.games,
                   (COALESCE(c.rush_yards, 0) + COALESCE(c.rec_yards, 0)) * 0.1
                   + COALESCE(c.total_tds, 0) * 6
                   + COALESCE(c.receptions, 0) * 1.0
                   + COALESCE(c.pass_yards, 0) * 0.04
                   + COALESCE(c.pass_tds, 0) * 4 as fpts,
                   COALESCE(c.rush_yards, 0) + COALESCE(c.rec_yards, 0) as scrimmage_yards,
                   COALESCE(c.total_tds, 0) as tds,
                   CASE WHEN c.position = 'QB'
                        THEN COALESCE(c.pass_attempts, 0) + COALESCE(c.carries, 0)
                        ELSE COALESCE(c.carries, 0) + COALESCE(c.targets, 0)
                   END as opportunities,
                   COALESCE(c.receptions, 0) as receptions,
                   COALESCE(c.rush_yards, 0) as rush_yards,
                   COALESCE(c.rec_yards, 0) as rec_yards,
                   COALESCE(c.pass_yards, 0) as pass_yards,
                   COALESCE(c.pass_tds, 0) as pass_tds
            FROM cfb_player_season_stats c
            WHERE c.season = ? AND c.games >= 4 {pos_filter}
            ORDER BY fpts DESC
        """, params)
        rows = cursor.fetchall()

        if not rows:
            return {"season": season, "available_seasons": available_seasons, "awards": []}

        def pdict(r):
            games = r[5] or 1
            fpts = r[6] or 0
            opps = r[9] or 1
            return {
                "player_id": r[0], "name": r[1] or "Unknown",
                "position": r[2] or "ATH", "team": r[3] or "",
                "conference": r[4] or "", "games": games,
                "ppg": round(fpts / games, 1),
                "total_fpts": round(fpts, 1),
                "scrimmage_yards": r[7] or 0,
                "tds": r[8] or 0,
                "opportunities": opps,
                "ppo": round(fpts / opps, 2) if opps > 0 else 0,
                "receptions": r[10] or 0,
                "rush_yards": r[11] or 0,
                "rec_yards": r[12] or 0,
                "pass_yards": r[13] or 0,
                "pass_tds": r[14] or 0,
            }

        players = [pdict(r) for r in rows]

        # Build awards
        awards = []

        # 1. MVP - highest total fantasy points
        mvp = max(players, key=lambda p: p["total_fpts"])
        awards.append({
            "key": "mvp", "name": "Fantasy MVP",
            "description": "highest total fantasy output",
            "winner": mvp,
            "runners_up": sorted(players, key=lambda p: p["total_fpts"], reverse=True)[1:5],
        })

        # 2. Most Efficient - highest PPO (min 50 opportunities)
        eff_players = [p for p in players if p["opportunities"] >= 50]
        if eff_players:
            best_eff = max(eff_players, key=lambda p: p["ppo"])
            awards.append({
                "key": "most_efficient", "name": "Most Efficient",
                "description": "highest fantasy points per opportunity",
                "winner": best_eff,
                "runners_up": sorted(eff_players, key=lambda p: p["ppo"], reverse=True)[1:5],
            })

        # 3. Iron Man - most games played with high production
        iron_players = sorted(players, key=lambda p: (p["games"], p["ppg"]), reverse=True)
        if iron_players:
            awards.append({
                "key": "iron_man", "name": "Iron Man",
                "description": "most durable high-output player",
                "winner": iron_players[0],
                "runners_up": iron_players[1:5],
            })

        # 4. Volume King - most total opportunities
        vol = max(players, key=lambda p: p["opportunities"])
        awards.append({
            "key": "volume_king", "name": "Volume King",
            "description": "most total touches and targets",
            "winner": vol,
            "runners_up": sorted(players, key=lambda p: p["opportunities"], reverse=True)[1:5],
        })

        # 5. Breakout Star - biggest YoY PPG increase
        prev_season = season - 1
        cursor.execute("""
            SELECT c.player_id,
                   (COALESCE(c.rush_yards, 0) + COALESCE(c.rec_yards, 0)) * 0.1
                   + COALESCE(c.total_tds, 0) * 6
                   + COALESCE(c.receptions, 0) * 1.0
                   + COALESCE(c.pass_yards, 0) * 0.04
                   + COALESCE(c.pass_tds, 0) * 4 as fpts,
                   c.games
            FROM cfb_player_season_stats c
            WHERE c.season = ? AND c.games >= 3
        """, (prev_season,))
        prev_map = {}
        for pr in cursor.fetchall():
            g = pr[2] or 1
            prev_map[pr[0]] = round((pr[1] or 0) / g, 1)

        breakout_candidates = []
        for p in players:
            if p["player_id"] in prev_map:
                prev_ppg = prev_map[p["player_id"]]
                if prev_ppg > 0:
                    delta = p["ppg"] - prev_ppg
                    p2 = dict(p)
                    p2["delta_ppg"] = round(delta, 1)
                    p2["prev_ppg"] = prev_ppg
                    breakout_candidates.append(p2)
        breakout_candidates.sort(key=lambda x: x.get("delta_ppg", 0), reverse=True)
        if breakout_candidates:
            awards.append({
                "key": "breakout_star", "name": "Breakout Star",
                "description": "biggest year-over-year production jump",
                "winner": breakout_candidates[0],
                "runners_up": breakout_candidates[1:5],
            })

        # 6. TD King - most total touchdowns
        td_king = max(players, key=lambda p: p["tds"])
        awards.append({
            "key": "redzone_king", "name": "TD King",
            "description": "most total touchdowns scored",
            "winner": td_king,
            "runners_up": sorted(players, key=lambda p: p["tds"], reverse=True)[1:5],
        })

        # 7. Yardage Machine - most scrimmage yards
        yd_machine = max(players, key=lambda p: p["scrimmage_yards"])
        awards.append({
            "key": "rising_stock", "name": "Yardage Machine",
            "description": "most total scrimmage yards",
            "winner": yd_machine,
            "runners_up": sorted(players, key=lambda p: p["scrimmage_yards"], reverse=True)[1:5],
        })

        # 8. Best PPG - highest per-game output (min 6 games)
        ppg_players = [p for p in players if p["games"] >= 6]
        if ppg_players:
            best_ppg = max(ppg_players, key=lambda p: p["ppg"])
            awards.append({
                "key": "best_floor", "name": "PPG Leader",
                "description": "highest per-game fantasy production",
                "winner": best_ppg,
                "runners_up": sorted(ppg_players, key=lambda p: p["ppg"], reverse=True)[1:5],
            })

        return {
            "season": season,
            "available_seasons": available_seasons,
            "awards": awards,
        }



def fetch_college_season_awards(season=None, position=None):
    return _cached(f"fetch_college_season_awards:{season}:{position}", lambda: _fetch_college_season_awards_uncached(season=season, position=position))

def _fetch_college_stat_explorer_uncached(season=None, position=None, x_stat="total_ypg", y_stat="ppg"):
    """College stat explorer — scatter plot with college-specific metrics."""
    COLLEGE_METRICS = {
        "ppg": "PPG", "total_ypg": "Total YPG", "rush_ypg": "Rush YPG",
        "rec_ypg": "Rec YPG", "pass_ypg": "Pass YPG", "tds": "Total TDs",
        "tds_per_game": "TDs/Game", "carries_g": "Carries/G", "targets_g": "Targets/G",
        "receptions_g": "Rec/G", "yards_per_carry": "Yards/Carry",
        "yards_per_rec": "Yards/Rec", "catch_rate": "Catch Rate %",
        "games": "Games", "opportunities_g": "Opps/G",
    }

    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT DISTINCT season FROM cfb_player_season_stats ORDER BY season DESC")
        available_seasons = [r[0] for r in cursor.fetchall()]
        if not season:
            season = available_seasons[0] if available_seasons else _current_nfl_season()

        if x_stat not in COLLEGE_METRICS:
            x_stat = "total_ypg"
        if y_stat not in COLLEGE_METRICS:
            y_stat = "ppg"

        pos_filter = ""
        params = [season]
        if position and position.upper() in ("QB", "RB", "WR", "TE", "ATH", "FB"):
            pos_filter = "AND c.position = ?"
            params.append(position.upper())

        cursor.execute(f"""
            SELECT c.player_id, c.player_name, c.position, c.team, c.conference,
                   c.games,
                   COALESCE(c.rush_yards, 0) as rush_yards,
                   COALESCE(c.rec_yards, 0) as rec_yards,
                   COALESCE(c.pass_yards, 0) as pass_yards,
                   COALESCE(c.total_tds, 0) as tds,
                   COALESCE(c.carries, 0) as carries,
                   COALESCE(c.targets, 0) as targets,
                   COALESCE(c.receptions, 0) as receptions,
                   COALESCE(c.pass_attempts, 0) as pass_attempts,
                   (COALESCE(c.rush_yards, 0) + COALESCE(c.rec_yards, 0)) * 0.1
                   + COALESCE(c.total_tds, 0) * 6
                   + COALESCE(c.receptions, 0) * 1.0
                   + COALESCE(c.pass_yards, 0) * 0.04
                   + COALESCE(c.pass_tds, 0) * 4 as fpts
            FROM cfb_player_season_stats c
            WHERE c.season = ? AND c.games >= 3 {pos_filter}
            ORDER BY fpts DESC
            LIMIT 300
        """, params)
        rows = cursor.fetchall()

        if not rows:
            return {
                "season": season, "available_seasons": available_seasons,
                "x_stat": x_stat, "y_stat": y_stat,
                "players": [], "metrics": COLLEGE_METRICS,
            }

        players = []
        for r in rows:
            games = r[5] or 1
            rush_yards = r[6] or 0
            rec_yards = r[7] or 0
            pass_yards = r[8] or 0
            tds = r[9] or 0
            carries = r[10] or 0
            targets = r[11] or 0
            receptions = r[12] or 0
            pass_attempts = r[13] or 0
            fpts = r[14] or 0
            pos = r[2] or "ATH"
            opps = (pass_attempts + carries) if pos == "QB" else (carries + targets)

            p = {
                "player_id": r[0],
                "name": r[1] or "Unknown",
                "position": r[2] or "ATH",
                "team": r[3] or "",
                "conference": r[4] or "",
                "games": games,
                "ppg": round(fpts / games, 1),
                "total_ypg": round((rush_yards + rec_yards + pass_yards) / games, 1),
                "rush_ypg": round(rush_yards / games, 1),
                "rec_ypg": round(rec_yards / games, 1),
                "pass_ypg": round(pass_yards / games, 1),
                "tds": tds,
                "tds_per_game": round(tds / games, 2),
                "carries_g": round(carries / games, 1),
                "targets_g": round(targets / games, 1),
                "receptions_g": round(receptions / games, 1),
                "yards_per_carry": round(rush_yards / carries, 1) if carries > 0 else 0,
                "yards_per_rec": round(rec_yards / receptions, 1) if receptions > 0 else 0,
                "catch_rate": round(receptions / targets * 100, 1) if targets > 0 else 0,
                "opportunities_g": round(opps / games, 1),
            }

            xv = p.get(x_stat)
            yv = p.get(y_stat)
            if xv is not None and yv is not None:
                p["x"] = xv
                p["y"] = yv
                players.append(p)

        return {
            "season": season,
            "available_seasons": available_seasons,
            "x_stat": x_stat,
            "y_stat": y_stat,
            "players": players,
            "metrics": COLLEGE_METRICS,
        }


# ---------------------------------------------------------------------------
# Waitlist
# ---------------------------------------------------------------------------



def fetch_college_stat_explorer(season=None, position=None, x_stat="total_ypg", y_stat="ppg"):
    return _cached(f"fetch_college_stat_explorer:{season}:{position}:{x_stat}:{y_stat}", lambda: _fetch_college_stat_explorer_uncached(season=season, position=position, x_stat=x_stat, y_stat=y_stat))
