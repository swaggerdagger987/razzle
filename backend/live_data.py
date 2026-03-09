"""
Razzle data layer — all SQLite queries for the API.
server.py calls these functions; they return dicts ready for JSON.
"""

import math
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"

FANTASY_POSITIONS = {"QB", "RB", "WR", "TE"}

# Rate metrics we pull from player_week_metrics (averaged per game)
RATE_METRICS = ["target_share", "air_yards_share", "wopr", "racr", "passing_epa", "receiving_epa", "rushing_epa", "dakota", "cpoe"]

# Shared stat SUM columns used across multiple query functions
_STAT_SUM_COLS = """
            SUM(s.fantasy_points_ppr) as fantasy_points_ppr,
            SUM(s.fantasy_points_std) as fantasy_points_std,
            SUM(s.passing_yards) as passing_yards,
            SUM(s.passing_tds) as passing_tds,
            SUM(s.rushing_yards) as rushing_yards,
            SUM(s.rushing_tds) as rushing_tds,
            SUM(s.receiving_yards) as receiving_yards,
            SUM(s.receiving_tds) as receiving_tds,
            SUM(s.receptions) as receptions,
            SUM(s.touchdowns) as touchdowns,
            SUM(s.turnovers) as turnovers,
            SUM(s.targets) as targets,
            SUM(s.carries) as carries,
            SUM(s.completions) as completions,
            SUM(s.attempts) as attempts,
            SUM(s.passing_air_yards) as passing_air_yards,
            SUM(s.receiving_air_yards) as receiving_air_yards,
            SUM(s.receiving_yards_after_catch) as receiving_yards_after_catch,
            SUM(s.passing_first_downs) as passing_first_downs,
            SUM(s.rushing_first_downs) as rushing_first_downs,
            SUM(s.receiving_first_downs) as receiving_first_downs,
            SUM(s.sacks_taken) as sacks_taken,
            SUM(s.sack_yards_lost) as sack_yards_lost,
            SUM(s.rushing_fumbles) as rushing_fumbles,
            SUM(s.receiving_fumbles) as receiving_fumbles,
            SUM(s.receiving_fumbles_lost) as receiving_fumbles_lost,
            SUM(s.sack_fumbles) as sack_fumbles,
            SUM(s.sack_fumbles_lost) as sack_fumbles_lost,
            SUM(s.fumbles) as fumbles,
            SUM(s.fumbles_lost) as fumbles_lost,
            SUM(s.offense_snaps) as offense_snaps,
            AVG(s.offense_pct) as offense_pct"""

# NFL team name → abbreviation (for combine data that stores full names)
TEAM_ABBREV = {
    "ARIZONA CARDINALS": "ARI", "ATLANTA FALCONS": "ATL", "BALTIMORE RAVENS": "BAL",
    "BUFFALO BILLS": "BUF", "CAROLINA PANTHERS": "CAR", "CHICAGO BEARS": "CHI",
    "CINCINNATI BENGALS": "CIN", "CLEVELAND BROWNS": "CLE", "DALLAS COWBOYS": "DAL",
    "DENVER BRONCOS": "DEN", "DETROIT LIONS": "DET", "GREEN BAY PACKERS": "GB",
    "HOUSTON TEXANS": "HOU", "INDIANAPOLIS COLTS": "IND", "JACKSONVILLE JAGUARS": "JAX",
    "KANSAS CITY CHIEFS": "KC", "LAS VEGAS RAIDERS": "LV", "LOS ANGELES CHARGERS": "LAC",
    "LOS ANGELES RAMS": "LAR", "MIAMI DOLPHINS": "MIA", "MINNESOTA VIKINGS": "MIN",
    "NEW ENGLAND PATRIOTS": "NE", "NEW ORLEANS SAINTS": "NO", "NEW YORK GIANTS": "NYG",
    "NEW YORK JETS": "NYJ", "OAKLAND RAIDERS": "LV", "PHILADELPHIA EAGLES": "PHI",
    "PITTSBURGH STEELERS": "PIT", "SAN FRANCISCO 49ERS": "SF", "SEATTLE SEAHAWKS": "SEA",
    "TAMPA BAY BUCCANEERS": "TB", "TENNESSEE TITANS": "TEN", "WASHINGTON COMMANDERS": "WAS",
    "WASHINGTON REDSKINS": "WAS", "WASHINGTON FOOTBALL TEAM": "WAS",
    "ST. LOUIS RAMS": "LAR", "SAN DIEGO CHARGERS": "LAC",
}


def get_conn():
    conn = sqlite3.connect(str(DB_PATH), timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


def _safe_div(a, b, decimals=1):
    """Safe division, returns None if denominator is 0/None."""
    if not b:
        return None
    return round(a / b, decimals)


def _enrich_with_derived_stats(items):
    """Add derived efficiency stats computed from existing aggregates."""
    for item in items:
        g = item.get("games") or 1
        item["ppg"] = _safe_div(item.get("fantasy_points_ppr") or 0, g)
        item["yards_per_carry"] = _safe_div(item.get("rushing_yards") or 0, item.get("carries") or 0)
        item["yards_per_rec"] = _safe_div(item.get("receiving_yards") or 0, item.get("receptions") or 0)
        item["yards_per_target"] = _safe_div(item.get("receiving_yards") or 0, item.get("targets") or 0)
        item["catch_rate"] = _safe_div((item.get("receptions") or 0) * 100, item.get("targets") or 0)
        item["comp_pct"] = _safe_div((item.get("completions") or 0) * 100, item.get("attempts") or 0)
        item["yards_per_att"] = _safe_div(item.get("passing_yards") or 0, item.get("attempts") or 0)
        item["rec_per_game"] = _safe_div(item.get("receptions") or 0, g)
        item["targets_per_game"] = _safe_div(item.get("targets") or 0, g)
        item["rush_ypg"] = _safe_div(item.get("rushing_yards") or 0, g)
        item["rec_ypg"] = _safe_div(item.get("receiving_yards") or 0, g)
        item["pass_ypg"] = _safe_div(item.get("passing_yards") or 0, g)
        # aDOT: average depth of target (receiving_air_yards / targets for WR/RB/TE, passing_air_yards / attempts for QB)
        pos = (item.get("position") or "").upper()
        if pos == "QB":
            item["adot"] = _safe_div(item.get("passing_air_yards") or 0, item.get("attempts") or 0)
        else:
            item["adot"] = _safe_div(item.get("receiving_air_yards") or 0, item.get("targets") or 0)
        # Half-PPR per game
        item["half_ppr_ppg"] = _safe_div(item.get("fantasy_points_half_ppr") or 0, g)
        # Snap share (already averaged in SQL, just round)
        snap_pct = item.get("offense_pct")
        item["snap_share"] = round(snap_pct, 1) if snap_pct else None
    return items


def _enrich_with_epa_per_play(items):
    """Compute EPA per play from rate metrics (must run after _enrich_with_rate_metrics)."""
    for item in items:
        g = item.get("games") or 1
        pass_epa = item.get("passing_epa") or 0
        rush_epa = item.get("rushing_epa") or 0
        rec_epa = item.get("receiving_epa") or 0
        # EPA values are per-game averages; total plays per game
        attempts_pg = (item.get("attempts") or 0) / g
        carries_pg = (item.get("carries") or 0) / g
        targets_pg = (item.get("targets") or 0) / g
        total_plays = attempts_pg + carries_pg + targets_pg
        if total_plays > 0:
            total_epa = pass_epa + rush_epa + rec_epa
            item["epa_per_play"] = round(total_epa / total_plays, 3)
        else:
            item["epa_per_play"] = None
    return items


def _enrich_with_rate_metrics(conn, items, season=None, career_mode=False):
    """Fetch average rate metrics from player_week_metrics for returned players."""
    if not items:
        return items

    player_ids = [item["player_id"] for item in items if item.get("player_id")]
    if not player_ids:
        return items

    placeholders = ",".join("?" * len(player_ids))
    stat_placeholders = ",".join("?" * len(RATE_METRICS))

    where = f"m.player_id IN ({placeholders}) AND m.stat_key IN ({stat_placeholders})"
    params = list(player_ids) + list(RATE_METRICS)

    if not career_mode and season:
        where += " AND m.season = ?"
        params.append(season)

    rows = conn.execute(f"""
        SELECT m.player_id, m.stat_key, AVG(m.stat_value) as avg_val
        FROM player_week_metrics m
        WHERE {where}
        GROUP BY m.player_id, m.stat_key
    """, params).fetchall()

    # Build lookup
    lookup = {}
    for r in rows:
        pid = r[0]
        if pid not in lookup:
            lookup[pid] = {}
        lookup[pid][r[1]] = round(r[2], 3) if r[2] is not None else None

    # Merge into items
    for item in items:
        pid = item.get("player_id")
        if pid and pid in lookup:
            for metric in RATE_METRICS:
                item[metric] = lookup[pid].get(metric)
        else:
            for metric in RATE_METRICS:
                item[metric] = None

    return items


def _enrich_with_breakout(conn, items, season=None, career_mode=False):
    """Detect breakout seasons (50%+ YoY PPR increase). Adds breakout_pct to items."""
    if not items:
        return items

    player_ids = [item["player_id"] for item in items if item.get("player_id")]
    if not player_ids:
        return items

    placeholders = ",".join("?" * len(player_ids))

    # Get per-season PPR totals for all returned players
    rows = conn.execute(f"""
        SELECT player_id, season, SUM(fantasy_points_ppr) as ppr
        FROM player_week_stats
        WHERE player_id IN ({placeholders})
        GROUP BY player_id, season
        ORDER BY player_id, season
    """, player_ids).fetchall()

    # Compute max YoY breakout % per player
    seasons_by_player = {}
    for r in rows:
        pid = r[0]
        if pid not in seasons_by_player:
            seasons_by_player[pid] = []
        seasons_by_player[pid].append({"season": r[1], "ppr": r[2] or 0})

    breakouts = {}
    for pid, seasons_list in seasons_by_player.items():
        seasons_list.sort(key=lambda x: x["season"])
        best_pct = 0
        best_season = None
        for i in range(1, len(seasons_list)):
            prev_ppr = seasons_list[i - 1]["ppr"]
            curr_ppr = seasons_list[i]["ppr"]
            if prev_ppr > 20:  # minimum threshold to avoid noise
                pct_change = ((curr_ppr - prev_ppr) / prev_ppr) * 100
                if pct_change > best_pct:
                    best_pct = pct_change
                    best_season = seasons_list[i]["season"]
        breakouts[pid] = {"pct": round(best_pct, 1), "season": best_season}

    for item in items:
        pid = item.get("player_id")
        if pid and pid in breakouts:
            item["breakout_pct"] = breakouts[pid]["pct"]
            item["breakout_season"] = breakouts[pid]["season"]
        else:
            item["breakout_pct"] = 0
            item["breakout_season"] = None

    return items


# ---------------------------------------------------------------------------
# Dynasty Value Score (DVS)
# ---------------------------------------------------------------------------

# Age curves: (peak_start, peak_end, rise_start, fall_end)
# Value is 1.0 during peak, ramps up from rise_start, decays to 0 at fall_end
_DVS_AGE_CURVES = {
    "QB": {"peak_start": 26, "peak_end": 30, "rise_start": 21, "fall_end": 40},
    "RB": {"peak_start": 22, "peak_end": 25, "rise_start": 20, "fall_end": 30},
    "WR": {"peak_start": 24, "peak_end": 28, "rise_start": 21, "fall_end": 33},
    "TE": {"peak_start": 25, "peak_end": 29, "rise_start": 22, "fall_end": 34},
}


def _age_multiplier(position, age):
    """Return 0.0-1.0 age curve multiplier for dynasty value."""
    if age is None:
        return 0.5  # unknown age gets neutral value
    curve = _DVS_AGE_CURVES.get(position, _DVS_AGE_CURVES["WR"])
    if age < curve["rise_start"]:
        return 0.7  # very young = still high upside
    if age <= curve["peak_start"]:
        # Ramp up to peak
        span = curve["peak_start"] - curve["rise_start"]
        return 0.7 + 0.3 * ((age - curve["rise_start"]) / max(span, 1))
    if age <= curve["peak_end"]:
        return 1.0  # peak years
    if age >= curve["fall_end"]:
        return 0.1  # past prime
    # Decline phase
    span = curve["fall_end"] - curve["peak_end"]
    return max(0.1, 1.0 - 0.9 * ((age - curve["peak_end"]) / max(span, 1)))


def _enrich_with_dynasty_value(items):
    """Compute Dynasty Value Score (DVS) for each player.

    DVS = production_score × age_multiplier
    production_score: PPR/game normalized to 0-100 (25 PPG = 100)
    age_multiplier: position-specific curve (0.1 to 1.0)
    """
    for item in items:
        ppg = item.get("ppg") or 0
        age = item.get("age")
        pos = item.get("position", "WR")

        # Production score: 25 PPG maps to 100 (elite), capped at 100
        production = min(100.0, ppg * 4.0)

        # Age multiplier
        age_mult = _age_multiplier(pos, age)

        # Dynasty value = production weighted by remaining career value
        dvs = round(production * age_mult, 1)
        item["dynasty_value"] = dvs

    return items


def db_stats():
    conn = get_conn()
    players = conn.execute("SELECT COUNT(*) FROM players").fetchone()[0]
    stats = conn.execute("SELECT COUNT(*) FROM player_week_stats").fetchone()[0]
    seasons = conn.execute("SELECT DISTINCT season FROM player_week_stats ORDER BY season").fetchall()
    conn.close()
    return {
        "players": players,
        "stat_rows": stats,
        "seasons": [r[0] for r in seasons],
    }


def fetch_players(
    search="",
    position="",
    positions="",
    team="",
    sort_key="fantasy_points_ppr",
    sort_dir="desc",
    limit=200,
    offset=0,
    season=0,
):
    conn = get_conn()

    # Determine season: 0 = latest, "career" = all seasons
    career_mode = str(season).lower() == "career"
    if not career_mode:
        season = int(season) if season else 0
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else 2024

    # Build position filter
    pos_list = []
    if positions:
        pos_list = [p.strip().upper() for p in positions.split(",") if p.strip()]
    elif position:
        pos_list = [position.strip().upper()]

    # Allowed sort columns (prevent SQL injection)
    safe_sorts = {
        "fantasy_points_ppr", "fantasy_points_half_ppr", "fantasy_points_std",
        "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
        "receiving_yards", "receiving_tds", "receptions", "touchdowns",
        "turnovers", "targets", "carries", "completions", "attempts",
        "passing_air_yards", "receiving_air_yards", "receiving_yards_after_catch",
        "passing_first_downs", "rushing_first_downs", "receiving_first_downs",
        "sacks_taken", "sack_yards_lost", "rushing_fumbles",
        "receiving_fumbles", "receiving_fumbles_lost",
        "sack_fumbles", "sack_fumbles_lost", "fumbles", "fumbles_lost",
        "offense_snaps", "offense_pct",
        "full_name", "position", "team", "games", "seasons", "age",
        "half_ppr_ppg", "cpoe", "epa_per_play",
    }
    if sort_key not in safe_sorts:
        sort_key = "fantasy_points_ppr"
    if sort_dir.lower() not in ("asc", "desc"):
        sort_dir = "desc"

    where = []
    params = []

    if career_mode:
        pass  # no season filter — aggregate all
    else:
        where.append("s.season = ?")
        params.append(season)

    if search:
        where.append("p.search_name LIKE ?")
        params.append(f"%{search.lower().replace(' ', '')}%")

    if pos_list:
        placeholders = ",".join("?" * len(pos_list))
        where.append(f"p.position IN ({placeholders})")
        params.extend(pos_list)

    if team:
        where.append("p.team = ?")
        params.append(team.strip().upper())

    where_clause = " AND ".join(where) if where else "1=1"

    # Handle sort expression
    sort_expr = sort_key
    if sort_key == "seasons":
        sort_expr = "COUNT(DISTINCT s.season)"
    elif sort_key == "games":
        sort_expr = "COUNT(*)"
    elif sort_key in ("full_name", "position", "team"):
        sort_expr = f"p.{sort_key}"
    elif sort_key in safe_sorts:
        sort_expr = f"SUM(s.{sort_key})"

    query = f"""
        SELECT
            p.player_id, p.full_name, p.position, p.team, p.age, p.college,
            COUNT(*) as games,
            COUNT(DISTINCT s.season) as seasons,
            SUM(s.fantasy_points_half_ppr) as fantasy_points_half_ppr,
            {_STAT_SUM_COLS}
        FROM players p
        JOIN player_week_stats s ON p.player_id = s.player_id
        WHERE {where_clause}
        GROUP BY p.player_id
        ORDER BY {sort_expr} {sort_dir}
        LIMIT ? OFFSET ?
    """
    params.extend([limit, offset])

    rows = conn.execute(query, params).fetchall()

    # Count total (for pagination)
    count_query = f"""
        SELECT COUNT(DISTINCT p.player_id)
        FROM players p
        JOIN player_week_stats s ON p.player_id = s.player_id
        WHERE {where_clause}
    """
    total = conn.execute(count_query, params[:-2]).fetchone()[0]

    items = [dict(r) for r in rows]
    _enrich_with_derived_stats(items)
    _enrich_with_rate_metrics(conn, items, season=season, career_mode=career_mode)
    _enrich_with_epa_per_play(items)
    _enrich_with_breakout(conn, items, season=season, career_mode=career_mode)
    _enrich_with_dynasty_value(items)

    conn.close()
    return {"count": total, "season": "career" if career_mode else season, "items": items}


def fetch_screener(body):
    """Complex multi-filter screener query (POST body)."""
    conn = get_conn()

    search = body.get("search", "")
    position = body.get("position", "")
    positions = body.get("positions", [])
    team = body.get("team", "")
    season = body.get("season", 0)
    sort_key = body.get("sort_key", "fantasy_points_ppr")
    sort_dir = body.get("sort_direction", "desc")
    limit = min(body.get("limit", 200), 1000)
    offset = body.get("offset", 0)
    filters = body.get("filters", [])
    relevance = body.get("relevance", "fantasy")

    # Determine season: 0 = latest, "career" = all seasons
    career_mode = str(season).lower() == "career"
    if not career_mode:
        season = int(season) if season else 0
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else 2024

    # Position list
    pos_list = []
    if positions:
        pos_list = [p.strip().upper() for p in positions]
    elif position:
        pos_list = [position.strip().upper()]

    # For fantasy relevance, default to fantasy positions
    if relevance == "fantasy" and not pos_list:
        pos_list = list(FANTASY_POSITIONS)

    where = []
    params = []

    if career_mode:
        pass  # no season filter
    else:
        where.append("s.season = ?")
        params.append(season)

    if search:
        where.append("p.search_name LIKE ?")
        params.append(f"%{search.lower().replace(' ', '')}%")

    if pos_list:
        placeholders = ",".join("?" * len(pos_list))
        where.append(f"p.position IN ({placeholders})")
        params.extend(pos_list)

    # Support multi-team filtering: comma-separated or list
    teams_param = body.get("teams", [])
    if teams_param and isinstance(teams_param, list) and len(teams_param) > 0:
        team_list = [t.strip().upper() for t in teams_param if t.strip()]
        if team_list:
            placeholders_t = ",".join("?" * len(team_list))
            where.append(f"p.team IN ({placeholders_t})")
            params.extend(team_list)
    elif team:
        where.append("p.team = ?")
        params.append(team.strip().upper())

    # Support minimum games played filter (HAVING clause added later)
    min_gp = body.get("min_gp", 0)

    where_clause = " AND ".join(where) if where else "1=1"

    # Safe sort — includes derived and rate metrics (computed post-query)
    safe_sorts = {
        "fantasy_points_ppr", "fantasy_points_half_ppr", "fantasy_points_std",
        "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
        "receiving_yards", "receiving_tds", "receptions", "touchdowns",
        "turnovers", "targets", "carries", "games", "ppg", "seasons",
        "full_name", "position", "team",
        # Phase 29: new aggregate stats
        "passing_first_downs", "rushing_first_downs", "receiving_first_downs",
        "sacks_taken", "sack_yards_lost", "rushing_fumbles",
        "receiving_fumbles", "receiving_fumbles_lost",
        "sack_fumbles", "sack_fumbles_lost", "fumbles", "fumbles_lost",
        "offense_snaps", "offense_pct",
        # Derived metrics (computed in Python, sorted client-side)
        "yards_per_carry", "yards_per_rec", "yards_per_target", "catch_rate",
        "comp_pct", "yards_per_att", "rec_per_game", "targets_per_game",
        "rush_ypg", "rec_ypg", "pass_ypg", "adot", "snap_share",
        # Rate metrics from player_week_metrics
        "target_share", "air_yards_share", "wopr", "racr",
        "passing_epa", "receiving_epa", "rushing_epa", "dakota", "cpoe",
        # Derived post-enrichment
        "half_ppr_ppg", "epa_per_play",
        # Dynasty value
        "dynasty_value", "age",
    }
    if sort_key not in safe_sorts:
        sort_key = "fantasy_points_ppr"
    if sort_dir.lower() not in ("asc", "desc"):
        sort_dir = "desc"

    # Columns that can be filtered via SQL HAVING (not derived/rate metrics)
    sql_filterable = {
        "fantasy_points_ppr", "fantasy_points_half_ppr", "fantasy_points_std",
        "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
        "receiving_yards", "receiving_tds", "receptions", "touchdowns",
        "turnovers", "targets", "carries", "games", "ppg", "seasons",
        "passing_first_downs", "rushing_first_downs", "receiving_first_downs",
        "sacks_taken", "sack_yards_lost", "fumbles", "fumbles_lost",
        "offense_snaps",
    }

    # Build having clause for advanced filters
    having = []
    ops = {"gt": ">", "gte": ">=", "lt": "<", "lte": "<=", "eq": "=", "neq": "!="}
    for f in filters:
        key = f.get("key", "")
        op = ops.get(f.get("op", ""), None)
        val = f.get("value")
        if not key or not op or val is None:
            continue
        # Only allow SQL-safe aggregate columns
        if key in sql_filterable:
            if key == "ppg":
                having.append(f"(SUM(s.fantasy_points_ppr) / MAX(1, COUNT(*))) {op} ?")
            elif key == "games":
                having.append(f"COUNT(*) {op} ?")
            elif key == "seasons":
                having.append(f"COUNT(DISTINCT s.season) {op} ?")
            else:
                having.append(f"SUM(s.{key}) {op} ?")
            params.append(float(val))

    # Add minimum games played filter
    if min_gp and int(min_gp) > 0:
        having.append("COUNT(*) >= ?")
        params.append(int(min_gp))

    having_clause = ""
    if having:
        having_clause = "HAVING " + " AND ".join(having)

    # Derived/rate metrics are computed post-query — sort by PPR in SQL, re-sort in Python
    sql_sortable = {
        "fantasy_points_ppr", "fantasy_points_half_ppr", "fantasy_points_std",
        "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
        "receiving_yards", "receiving_tds", "receptions", "touchdowns",
        "turnovers", "targets", "carries",
        "passing_first_downs", "rushing_first_downs", "receiving_first_downs",
        "sacks_taken", "sack_yards_lost", "fumbles", "fumbles_lost",
        "offense_snaps",
    }
    python_sort = sort_key not in sql_sortable and sort_key not in ("ppg", "games", "seasons", "full_name", "position", "team", "age")

    # Handle sort expression
    effective_sort = sort_key if not python_sort else "fantasy_points_ppr"
    order_expr = effective_sort
    if effective_sort == "ppg":
        order_expr = "(SUM(s.fantasy_points_ppr) / MAX(1, COUNT(*)))"
    elif effective_sort == "age":
        order_expr = "p.age"
    elif effective_sort == "games":
        order_expr = "COUNT(*)"
    elif effective_sort == "seasons":
        order_expr = "COUNT(DISTINCT s.season)"
    elif effective_sort in ("full_name", "position", "team"):
        order_expr = f"p.{effective_sort}"
    else:
        order_expr = f"SUM(s.{effective_sort})"

    query = f"""
        SELECT
            p.player_id, p.full_name, p.position, p.team, p.age, p.college,
            COUNT(*) as games,
            COUNT(DISTINCT s.season) as seasons,
            SUM(s.fantasy_points_half_ppr) as fantasy_points_half_ppr,
            {_STAT_SUM_COLS}
        FROM players p
        JOIN player_week_stats s ON p.player_id = s.player_id
        WHERE {where_clause}
        GROUP BY p.player_id
        {having_clause}
        ORDER BY {order_expr} {sort_dir}
        LIMIT ? OFFSET ?
    """
    params.extend([limit, offset])

    rows = conn.execute(query, params).fetchall()

    # Count
    count_query = f"""
        SELECT COUNT(*) FROM (
            SELECT p.player_id
            FROM players p
            JOIN player_week_stats s ON p.player_id = s.player_id
            WHERE {where_clause}
            GROUP BY p.player_id
            {having_clause}
        )
    """
    count_params = params[:-2]  # exclude limit/offset
    total = conn.execute(count_query, count_params).fetchone()[0]

    items = [dict(r) for r in rows]
    _enrich_with_derived_stats(items)
    _enrich_with_rate_metrics(conn, items, season=season, career_mode=career_mode)
    _enrich_with_epa_per_play(items)
    _enrich_with_breakout(conn, items, season=season, career_mode=career_mode)
    _enrich_with_dynasty_value(items)

    # Re-sort in Python if sorting by a derived/rate metric
    if python_sort:
        reverse = sort_dir.lower() == "desc"
        items.sort(key=lambda x: x.get(sort_key) or 0, reverse=reverse)

    conn.close()
    return {"count": total, "season": "career" if career_mode else season, "items": items}


def get_filter_options():
    """Return available positions, teams, and stat columns for autocomplete."""
    conn = get_conn()

    positions = [r[0] for r in conn.execute(
        "SELECT DISTINCT position FROM players WHERE position IN ('QB','RB','WR','TE') ORDER BY position"
    ).fetchall()]

    teams = [r[0] for r in conn.execute(
        "SELECT DISTINCT team FROM players WHERE team IS NOT NULL AND team != '' ORDER BY team"
    ).fetchall()]

    stat_keys = [r[0] for r in conn.execute(
        "SELECT DISTINCT stat_key FROM player_week_metrics ORDER BY stat_key"
    ).fetchall()]

    seasons = [r[0] for r in conn.execute(
        "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
    ).fetchall()]

    conn.close()
    return {
        "positions": positions,
        "teams": teams,
        "stat_keys": stat_keys,
        "seasons": seasons,
    }


def fetch_player_weeks(player_id, season=0):
    """Return week-by-week stats for a single player."""
    conn = get_conn()

    if not season:
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        season = row[0] if row and row[0] else 2024

    rows = conn.execute("""
        SELECT s.*, p.full_name, p.position, p.team
        FROM player_week_stats s
        JOIN players p ON p.player_id = s.player_id
        WHERE s.player_id = ? AND s.season = ?
        ORDER BY s.week ASC
    """, (player_id, season)).fetchall()

    player_info = conn.execute(
        "SELECT player_id, full_name, position, team, age, college FROM players WHERE player_id = ?",
        (player_id,)
    ).fetchone()

    conn.close()

    return {
        "player": dict(player_info) if player_info else {},
        "season": season,
        "weeks": [dict(r) for r in rows],
    }


def fetch_player_seasons(player_id):
    """Return season-level aggregates for a single player (for trend charts)."""
    conn = get_conn()

    player_info = conn.execute(
        "SELECT player_id, full_name, position, team, age, college FROM players WHERE player_id = ?",
        (player_id,)
    ).fetchone()

    rows = conn.execute(f"""
        SELECT
            s.season,
            COUNT(*) as games,
            {_STAT_SUM_COLS}
        FROM player_week_stats s
        WHERE s.player_id = ?
        GROUP BY s.season
        ORDER BY s.season ASC
    """, (player_id,)).fetchall()

    seasons = [dict(r) for r in rows]
    _enrich_with_derived_stats(seasons)

    conn.close()
    return {
        "player": dict(player_info) if player_info else {},
        "seasons": seasons,
    }


def fetch_prospects(
    search="",
    position="",
    positions="",
    school="",
    sort_key="draft_pick",
    sort_dir="asc",
    limit=200,
    offset=0,
    draft_year=0,
):
    """Return prospect data from combine + draft picks, joined."""
    conn = get_conn()

    if not draft_year:
        row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
        draft_year = row[0] if row and row[0] else 2025

    # Position list
    pos_list = []
    if positions:
        pos_list = [p.strip().upper() for p in positions.split(",") if p.strip()]
    elif position:
        pos_list = [position.strip().upper()]

    where = ["c.draft_year = ?"]
    params = [draft_year]

    if search:
        search_clean = search.lower().replace(" ", "")
        where.append("LOWER(REPLACE(c.player_name, ' ', '')) LIKE ?")
        params.append(f"%{search_clean}%")

    if pos_list:
        placeholders = ",".join("?" * len(pos_list))
        where.append(f"c.position IN ({placeholders})")
        params.extend(pos_list)

    if school:
        where.append("(c.school LIKE ? OR d.college LIKE ?)")
        params.extend([f"%{school}%", f"%{school}%"])

    where_clause = " AND ".join(where)

    # Safe sort columns
    safe_sorts = {
        "player_name": "c.player_name",
        "position": "c.position",
        "school": "c.school",
        "draft_pick": "c.draft_pick",
        "draft_round": "c.draft_round",
        "draft_team": "c.draft_team",
        "height_inches": "c.height_inches",
        "weight": "c.weight",
        "forty": "c.forty",
        "bench": "c.bench",
        "vertical": "c.vertical",
        "broad_jump": "c.broad_jump",
        "cone": "c.cone",
        "shuttle": "c.shuttle",
        "career_av": "d.career_av",
        "games": "d.games",
    }
    # College sort keys use Python re-sort (derived from batch enrichment)
    college_sort_keys = {
        "college_games", "college_pass_yards", "college_pass_tds",
        "college_rush_yards", "college_rush_tds", "college_carries",
        "college_rec_yards", "college_rec_tds", "college_receptions",
        "college_targets", "college_total_tds", "college_total_yards",
        "college_ypc", "college_cmp_pct", "college_ypr", "college_ypg",
    }
    python_resort = sort_key in college_sort_keys
    order_expr = safe_sorts.get(sort_key, "c.draft_pick")
    if sort_dir.lower() not in ("asc", "desc"):
        sort_dir = "asc"

    # NULLS LAST for numeric sorts
    nulls_clause = ""
    if sort_key in ("forty", "bench", "vertical", "broad_jump", "cone", "shuttle",
                     "draft_pick", "draft_round", "height_inches", "weight",
                     "career_av", "games"):
        if sort_dir.lower() == "asc":
            nulls_clause = f"CASE WHEN {order_expr} IS NULL THEN 1 ELSE 0 END,"
        else:
            nulls_clause = f"CASE WHEN {order_expr} IS NULL THEN 1 ELSE 0 END,"

    select_cols = """
            c.player_name, c.position, c.school, c.draft_year,
            c.draft_team, c.draft_round, c.draft_pick,
            c.height_inches, c.weight,
            c.forty, c.bench, c.vertical, c.broad_jump, c.cone, c.shuttle,
            c.pfr_id, c.cfb_id,
            d.career_av, d.draft_av, d.games as nfl_games,
            d.allpro, d.probowls, d.seasons_started,
            d.pass_yards as nfl_pass_yards, d.pass_tds as nfl_pass_tds,
            d.rush_yards as nfl_rush_yards, d.rush_tds as nfl_rush_tds,
            d.rec_yards as nfl_rec_yards, d.rec_tds as nfl_rec_tds,
            d.receptions as nfl_receptions
    """
    from_clause = """
        FROM combine_data c
        LEFT JOIN draft_picks d
            ON c.draft_year = d.season
            AND LOWER(REPLACE(c.player_name, ' ', '')) = LOWER(REPLACE(d.player_name, ' ', ''))
            AND c.position = d.position
        WHERE {where_clause}
    """.format(where_clause=where_clause)

    # Count
    total = conn.execute(f"SELECT COUNT(*) {from_clause}", params).fetchone()[0]

    if python_resort:
        # Fetch all for Python re-sort after college enrichment
        query = f"SELECT {select_cols} {from_clause} ORDER BY c.player_name ASC"
        rows = conn.execute(query, params).fetchall()
    else:
        query = f"SELECT {select_cols} {from_clause} ORDER BY {nulls_clause} {order_expr} {sort_dir} LIMIT ? OFFSET ?"
        rows = conn.execute(query, params + [limit, offset]).fetchall()

    items = []
    for r in rows:
        item = dict(r)
        # Compute height display string
        ht = item.get("height_inches")
        if ht:
            item["height_display"] = f"{ht // 12}'{ht % 12}\""
        else:
            item["height_display"] = None
        # Abbreviate team name
        dt = (item.get("draft_team") or "").upper()
        item["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)
        items.append(item)

    # Enrich with college production stats (batch cross-reference)
    _enrich_prospects_with_college(conn, items)

    # Python re-sort for college-derived columns
    if python_resort:
        reverse = sort_dir.lower() == "desc"
        items.sort(key=lambda x: (x.get(sort_key) is None, -(x.get(sort_key) or 0) if reverse else (x.get(sort_key) or 0)))
        items = items[offset:offset + limit]

    conn.close()
    return {"count": total, "draft_year": draft_year, "items": items}


# Common nickname → full name mapping for college-prospect matching
_NICKNAME_MAP = {
    "cam": "cameron", "rob": "robert", "mike": "michael", "will": "william",
    "joe": "joseph", "dan": "daniel", "tom": "thomas", "matt": "matthew",
    "ben": "benjamin", "jake": "jacob", "nick": "nicholas", "tony": "anthony",
    "chris": "christopher", "alex": "alexander", "sam": "samuel", "max": "maximilian",
    "drew": "andrew", "ted": "theodore", "jim": "james", "pat": "patrick",
    "dave": "david", "rick": "richard", "dick": "richard", "bill": "william",
    "bob": "robert", "ed": "edward", "abe": "abraham", "ty": "tyler",
    "jo": "joseph", "ray": "raymond", "ken": "kenneth", "ron": "ronald",
    "greg": "gregory", "phil": "philip", "nic": "nicholas", "nate": "nathan",
}

def _name_variants(name):
    """Generate normalized name variants including nickname expansions."""
    clean = name.lower().replace(" ", "").replace(".", "").replace("'", "").replace("-", "")
    variants = {clean}
    # Try expanding first name
    parts = name.lower().strip().split()
    if len(parts) >= 2:
        first = parts[0].replace(".", "").replace("'", "").replace("-", "")
        rest = "".join(p.replace(".", "").replace("'", "").replace("-", "") for p in parts[1:])
        # Nickname → full name
        if first in _NICKNAME_MAP:
            variants.add(_NICKNAME_MAP[first] + rest)
        # Full name → nickname (reverse lookup)
        for nick, full in _NICKNAME_MAP.items():
            if first == full:
                variants.add(nick + rest)
        # Jr/Sr/III suffix handling
        for suffix in ("jr", "sr", "ii", "iii", "iv"):
            variants.add(clean.replace(suffix, ""))
            variants.add(clean + suffix)
    return variants


def _enrich_prospects_with_college(conn, items):
    """Batch-enrich prospect rows with college career stats from cfb_player_season_stats."""
    if not items:
        return

    # Build a lookup of college career totals by normalized name
    all_college = conn.execute("""
        SELECT
            LOWER(REPLACE(REPLACE(REPLACE(REPLACE(player_name, ' ', ''), '.', ''), '''', ''), '-', '')) as name_key,
            SUM(games) as college_games,
            SUM(pass_yards) as college_pass_yards,
            SUM(pass_tds) as college_pass_tds,
            SUM(completions) as college_completions,
            SUM(pass_attempts) as college_pass_attempts,
            SUM(rush_yards) as college_rush_yards,
            SUM(rush_tds) as college_rush_tds,
            SUM(carries) as college_carries,
            SUM(rec_yards) as college_rec_yards,
            SUM(rec_tds) as college_rec_tds,
            SUM(receptions) as college_receptions,
            SUM(targets) as college_targets,
            SUM(total_tds) as college_total_tds,
            SUM(total_yards) as college_total_yards
        FROM cfb_player_season_stats
        GROUP BY name_key
    """).fetchall()

    college_lookup = {}
    for r in all_college:
        d = dict(r)
        key = d.pop("name_key")
        college_lookup[key] = d

    for item in items:
        name = item.get("player_name", "")
        variants = _name_variants(name)
        college = None
        for v in variants:
            college = college_lookup.get(v)
            if college:
                break
        if college:
            item.update(college)
            # Derived stats
            g = college.get("college_games") or 1
            item["college_ypc"] = _safe_div(college.get("college_rush_yards") or 0, college.get("college_carries") or 0)
            item["college_cmp_pct"] = _safe_div((college.get("college_completions") or 0) * 100, college.get("college_pass_attempts") or 0)
            item["college_ypr"] = _safe_div(college.get("college_rec_yards") or 0, college.get("college_receptions") or 0)
            item["college_ypg"] = _safe_div(college.get("college_total_yards") or 0, g)
        else:
            # Set nulls so frontend can check
            for k in ("college_games", "college_pass_yards", "college_pass_tds",
                       "college_rush_yards", "college_rush_tds", "college_carries",
                       "college_rec_yards", "college_rec_tds", "college_receptions",
                       "college_targets", "college_total_tds", "college_total_yards",
                       "college_ypc", "college_cmp_pct", "college_ypr", "college_ypg"):
                item[k] = None


def fetch_prospect_years():
    """Return available draft years for the prospect screener."""
    conn = get_conn()
    years = [r[0] for r in conn.execute(
        "SELECT DISTINCT draft_year FROM combine_data ORDER BY draft_year DESC"
    ).fetchall()]

    schools = [r[0] for r in conn.execute(
        "SELECT DISTINCT school FROM combine_data WHERE school IS NOT NULL AND school != '' ORDER BY school"
    ).fetchall()]

    positions = [r[0] for r in conn.execute(
        "SELECT DISTINCT position FROM combine_data ORDER BY position"
    ).fetchall()]

    conn.close()
    return {"years": years, "schools": schools, "positions": positions}


def fetch_player_profile(player_id):
    """Return a rich player profile: bio, season-by-season stats, combine/draft data."""
    conn = get_conn()

    # Player bio
    player_info = conn.execute(
        "SELECT player_id, full_name, position, team, age, college FROM players WHERE player_id = ?",
        (player_id,)
    ).fetchone()

    if not player_info:
        conn.close()
        return {"player": {}, "seasons": [], "combine": None}

    player = dict(player_info)

    # Season-by-season aggregates
    rows = conn.execute(f"""
        SELECT
            s.season,
            COUNT(*) as games,
            {_STAT_SUM_COLS}
        FROM player_week_stats s
        WHERE s.player_id = ?
        GROUP BY s.season
        ORDER BY s.season ASC
    """, (player_id,)).fetchall()

    seasons = [dict(r) for r in rows]
    _enrich_with_derived_stats(seasons)

    # Enrich each season with rate metrics
    for season_row in seasons:
        items_for_rate = [{"player_id": player_id, **season_row}]
        _enrich_with_rate_metrics(conn, items_for_rate, season=season_row["season"])
        for metric in RATE_METRICS:
            season_row[metric] = items_for_rate[0].get(metric)

    # Career totals
    career = {}
    if seasons:
        for key in ["games", "fantasy_points_ppr", "fantasy_points_std",
                     "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
                     "receiving_yards", "receiving_tds", "receptions", "touchdowns",
                     "turnovers", "targets", "carries", "completions", "attempts",
                     "passing_air_yards", "receiving_air_yards", "receiving_yards_after_catch",
                     "passing_first_downs", "rushing_first_downs", "receiving_first_downs",
                     "sacks_taken", "sack_yards_lost", "fumbles", "fumbles_lost",
                     "offense_snaps"]:
            career[key] = sum(s.get(key) or 0 for s in seasons)
        career["seasons"] = len(seasons)
        _enrich_with_derived_stats([career])

    # Combine/draft data (match by name + position)
    combine = None
    name = player.get("full_name", "")
    pos = player.get("position", "")
    if name and pos:
        search_name = name.lower().replace(" ", "")
        combine_row = conn.execute("""
            SELECT c.*, d.career_av, d.draft_av, d.allpro, d.probowls, d.seasons_started
            FROM combine_data c
            LEFT JOIN draft_picks d
                ON c.draft_year = d.season
                AND LOWER(REPLACE(c.player_name, ' ', '')) = LOWER(REPLACE(d.player_name, ' ', ''))
                AND c.position = d.position
            WHERE LOWER(REPLACE(c.player_name, ' ', '')) = ?
                AND c.position = ?
            ORDER BY c.draft_year DESC
            LIMIT 1
        """, (search_name, pos)).fetchone()

        if combine_row:
            c = dict(combine_row)
            ht = c.get("height_inches")
            if ht:
                c["height_display"] = f"{ht // 12}'{ht % 12}\""
            dt = (c.get("draft_team") or "").upper()
            c["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)
            combine = c

    conn.close()
    return {
        "player": player,
        "seasons": seasons,
        "career": career,
        "combine": combine,
    }


def fetch_prospect_profile(name, position="", draft_year=0):
    """Return a rich prospect profile with combine data and position-group percentiles."""
    conn = get_conn()

    if not draft_year:
        row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
        draft_year = row[0] if row and row[0] else 2025

    search_name = name.lower().replace(" ", "")

    # Build WHERE clause
    where = "LOWER(REPLACE(c.player_name, ' ', '')) = ?"
    params = [search_name]
    if position:
        where += " AND c.position = ?"
        params.append(position.upper())

    # Get this prospect's data
    prospect_row = conn.execute(f"""
        SELECT
            c.player_name, c.position, c.school, c.draft_year,
            c.draft_team, c.draft_round, c.draft_pick,
            c.height_inches, c.weight,
            c.forty, c.bench, c.vertical, c.broad_jump, c.cone, c.shuttle,
            c.pfr_id, c.cfb_id,
            d.career_av, d.draft_av, d.games as nfl_games,
            d.allpro, d.probowls, d.seasons_started,
            d.pass_yards as nfl_pass_yards, d.pass_tds as nfl_pass_tds,
            d.rush_yards as nfl_rush_yards, d.rush_tds as nfl_rush_tds,
            d.rec_yards as nfl_rec_yards, d.rec_tds as nfl_rec_tds,
            d.receptions as nfl_receptions
        FROM combine_data c
        LEFT JOIN draft_picks d
            ON c.draft_year = d.season
            AND LOWER(REPLACE(c.player_name, ' ', '')) = LOWER(REPLACE(d.player_name, ' ', ''))
            AND c.position = d.position
        WHERE {where}
        ORDER BY c.draft_year DESC
        LIMIT 1
    """, params).fetchone()

    if not prospect_row:
        conn.close()
        return {"prospect": None, "percentiles": {}}

    prospect = dict(prospect_row)

    # Format height display
    ht = prospect.get("height_inches")
    if ht:
        prospect["height_display"] = f"{ht // 12}'{ht % 12}\""
    else:
        prospect["height_display"] = None

    # Abbreviate team name
    dt = (prospect.get("draft_team") or "").upper()
    prospect["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)

    # Compute position-group percentiles for combine metrics
    pos = prospect["position"]
    combine_metrics = {
        "forty": "lower",       # lower is better
        "bench": "higher",
        "vertical": "higher",
        "broad_jump": "higher",
        "cone": "lower",        # lower is better
        "shuttle": "lower",     # lower is better
        "height_inches": "higher",
        "weight": "higher",
    }

    # Batch percentile computation: single query for all 8 metrics
    metric_cols = ", ".join(combine_metrics.keys())
    all_rows = conn.execute(
        f"SELECT {metric_cols} FROM combine_data WHERE position = ?", (pos,)
    ).fetchall()
    metric_names = list(combine_metrics.keys())

    percentiles = {}
    for i, metric in enumerate(metric_names):
        val = prospect.get(metric)
        if val is None:
            percentiles[metric] = None
            continue

        all_vals = [r[i] for r in all_rows if r[i] is not None]
        if not all_vals:
            percentiles[metric] = None
            continue

        direction = combine_metrics[metric]
        if direction == "lower":
            # For time-based metrics, lower is better → percentile = % of players slower than you
            pct = sum(1 for v in all_vals if v > val) / len(all_vals) * 100
        else:
            # For distance/reps metrics, higher is better → percentile = % of players below you
            pct = sum(1 for v in all_vals if v < val) / len(all_vals) * 100

        percentiles[metric] = round(pct, 1)

    # ── College production cross-reference ──────────────────────────
    college = _fetch_college_for_prospect(conn, prospect)

    conn.close()
    return {"prospect": prospect, "percentiles": percentiles, "college": college}


def _fetch_college_for_prospect(conn, prospect):
    """Cross-reference a prospect with cfb_player_season_stats via name matching."""
    name = prospect.get("player_name", "")
    school = prospect.get("school", "")
    if not name:
        return None

    variants = _name_variants(name)

    # Try each variant until we find a match
    rows = []
    for variant in variants:
        rows = conn.execute("""
            SELECT player_id, player_name, position, team, conference, season,
                   games, completions, pass_attempts, pass_yards, pass_tds,
                   ints_thrown, sacks_taken, carries, rush_yards, rush_tds,
                   receptions, targets, rec_yards, rec_tds,
                   fumbles, total_tds, total_yards
            FROM cfb_player_season_stats
            WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(player_name, ' ', ''), '.', ''), '''', ''), '-', '')) = ?
            ORDER BY season ASC
        """, (variant,)).fetchall()
        if rows:
            break

    if not rows:
        return None

    season_items = [dict(r) for r in rows]

    # If multiple players match the name, narrow by school if possible
    if school and len(set(r["player_id"] for r in season_items)) > 1:
        school_clean = school.lower().replace(" ", "")
        filtered = [r for r in season_items if r.get("team", "").lower().replace(" ", "") == school_clean]
        if filtered:
            season_items = filtered
        else:
            # Try partial match (e.g., "Ohio State" in "Ohio St")
            filtered = [r for r in season_items if school_clean[:6] in r.get("team", "").lower().replace(" ", "")]
            if filtered:
                season_items = filtered

    # Keep only one player_id (the best match)
    pid = season_items[0]["player_id"]
    season_items = [r for r in season_items if r["player_id"] == pid]

    # Enrich with derived stats
    season_items = _enrich_college_derived(season_items)

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
    career = _enrich_college_derived([career])[0]

    # Compute dominator rating for WR/TE (team receiving share in best season)
    dominator = None
    pos = (prospect.get("position") or "").upper()
    has_receiving = pos in ("WR", "TE") or "WR" in pos or "TE" in pos
    # Also compute for anyone with significant receiving stats
    if not has_receiving and (career.get("receptions") or 0) >= 30:
        has_receiving = True
    if has_receiving:
        # Batch: collect all (team, season) pairs and query once
        team_season_pairs = []
        for s in season_items:
            team = s.get("team")
            season_yr = s.get("season")
            if team and season_yr and (s.get("rec_yards") or 0) >= 100:
                team_season_pairs.append((team, season_yr))
        if team_season_pairs:
            placeholders = " OR ".join(["(team = ? AND season = ?)"] * len(team_season_pairs))
            flat_params = [v for pair in team_season_pairs for v in pair]
            team_totals = conn.execute(f"""
                SELECT team, season, SUM(rec_yards), SUM(rec_tds)
                FROM cfb_player_season_stats
                WHERE ({placeholders}) AND position IN ('WR', 'TE', 'RB')
                GROUP BY team, season
            """, flat_params).fetchall()
            totals_map = {(r[0], r[1]): (r[2], r[3]) for r in team_totals}
            for s in season_items:
                team = s.get("team")
                season_yr = s.get("season")
                rec_yds = s.get("rec_yards") or 0
                rec_tds = s.get("rec_tds") or 0
                if not team or not season_yr or rec_yds < 100:
                    continue
                totals = totals_map.get((team, season_yr))
                if totals and totals[0] and totals[0] > 0:
                    yd_share = rec_yds / totals[0] * 100
                    td_share = (rec_tds / totals[1] * 100) if totals[1] and totals[1] > 0 else 0
                    dom = (yd_share + td_share) / 2
                    if dominator is None or dom > dominator:
                        dominator = round(dom, 1)

    return {
        "seasons": season_items,
        "career": career,
        "dominator_rating": dominator,
        "seasons_played": len(season_items),
        "player_id": pid,
    }


def fetch_prospect_comps(name, position="", draft_year=0, limit=5):
    """Find NFL players with the most similar combine athletic profiles."""
    conn = get_conn()

    if not draft_year:
        row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
        draft_year = row[0] if row and row[0] else 2025

    search_name = name.lower().replace(" ", "")

    # Get the target prospect's combine data
    where = "LOWER(REPLACE(player_name, ' ', '')) = ?"
    params = [search_name]
    if position:
        where += " AND position = ?"
        params.append(position.upper())

    target = conn.execute(f"""
        SELECT player_name, position, draft_year,
               forty, bench, vertical, broad_jump, cone, shuttle
        FROM combine_data
        WHERE {where}
        ORDER BY draft_year DESC LIMIT 1
    """, params).fetchone()

    if not target:
        conn.close()
        return {"comps": [], "prospect_name": name}

    target = dict(target)
    pos = target["position"]

    # Combine metrics with direction for percentile computation
    metric_keys = ["forty", "bench", "vertical", "broad_jump", "cone", "shuttle"]
    metric_dirs = {"forty": "lower", "bench": "higher", "vertical": "higher",
                   "broad_jump": "higher", "cone": "lower", "shuttle": "lower"}

    # Get position-group stats for percentile normalization
    pos_stats = {}
    for mk in metric_keys:
        rows = conn.execute(
            f"SELECT {mk} FROM combine_data WHERE position = ? AND {mk} IS NOT NULL", (pos,)
        ).fetchall()
        vals = sorted([r[0] for r in rows])
        if vals:
            pos_stats[mk] = vals

    # Compute target's percentiles
    target_pcts = {}
    for mk in metric_keys:
        val = target.get(mk)
        if val is None or mk not in pos_stats:
            continue
        all_vals = pos_stats[mk]
        if metric_dirs[mk] == "lower":
            pct = sum(1 for v in all_vals if v > val) / len(all_vals) * 100
        else:
            pct = sum(1 for v in all_vals if v < val) / len(all_vals) * 100
        target_pcts[mk] = pct

    if len(target_pcts) < 2:
        conn.close()
        return {"comps": [], "prospect_name": target["player_name"]}

    # Get all other players at same position (excluding target) with draft pick data
    others = conn.execute("""
        SELECT c.player_name, c.position, c.draft_year, c.school,
               c.draft_team, c.draft_round, c.draft_pick,
               c.forty, c.bench, c.vertical, c.broad_jump, c.cone, c.shuttle,
               d.career_av, d.games as nfl_games,
               d.pass_yards as nfl_pass_yards, d.pass_tds as nfl_pass_tds,
               d.rush_yards as nfl_rush_yards, d.rush_tds as nfl_rush_tds,
               d.rec_yards as nfl_rec_yards, d.rec_tds as nfl_rec_tds,
               d.receptions as nfl_receptions, d.allpro, d.probowls
        FROM combine_data c
        LEFT JOIN draft_picks d
            ON c.draft_year = d.season
            AND LOWER(REPLACE(c.player_name, ' ', '')) = LOWER(REPLACE(d.player_name, ' ', ''))
            AND c.position = d.position
        WHERE c.position = ?
          AND LOWER(REPLACE(c.player_name, ' ', '')) != ?
    """, (pos, search_name)).fetchall()

    # Compute similarity for each candidate
    comps = []
    for row in others:
        other = dict(row)

        # Compute this player's percentiles on shared metrics
        shared_metrics = []
        other_pcts = {}
        for mk in metric_keys:
            oval = other.get(mk)
            if oval is None or mk not in target_pcts or mk not in pos_stats:
                continue
            all_vals = pos_stats[mk]
            if metric_dirs[mk] == "lower":
                pct = sum(1 for v in all_vals if v > oval) / len(all_vals) * 100
            else:
                pct = sum(1 for v in all_vals if v < oval) / len(all_vals) * 100
            other_pcts[mk] = pct
            shared_metrics.append(mk)

        if len(shared_metrics) < 2:
            continue

        # Euclidean distance on shared percentiles (normalized to 0-100 scale)
        dist_sq = sum((target_pcts[mk] - other_pcts[mk]) ** 2 for mk in shared_metrics)
        max_dist = math.sqrt(len(shared_metrics) * 100 ** 2)
        dist = math.sqrt(dist_sq)

        # Convert distance to similarity score (0-100, higher = more similar)
        similarity = round(max(0, (1 - dist / max_dist) * 100), 1)

        # Abbreviate team
        dt = (other.get("draft_team") or "").upper()
        other["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)

        comps.append({
            "player_name": other["player_name"],
            "position": other["position"],
            "draft_year": other["draft_year"],
            "school": other.get("school"),
            "draft_team": other.get("draft_team"),
            "draft_round": other.get("draft_round"),
            "draft_pick": other.get("draft_pick"),
            "nfl_games": other.get("nfl_games"),
            "career_av": other.get("career_av"),
            "nfl_pass_yards": other.get("nfl_pass_yards"),
            "nfl_pass_tds": other.get("nfl_pass_tds"),
            "nfl_rush_yards": other.get("nfl_rush_yards"),
            "nfl_rush_tds": other.get("nfl_rush_tds"),
            "nfl_rec_yards": other.get("nfl_rec_yards"),
            "nfl_rec_tds": other.get("nfl_rec_tds"),
            "nfl_receptions": other.get("nfl_receptions"),
            "allpro": other.get("allpro"),
            "probowls": other.get("probowls"),
            "similarity": similarity,
            "shared_metrics": len(shared_metrics),
            "percentiles": {mk: round(other_pcts[mk], 1) for mk in shared_metrics},
        })

    # Sort by similarity descending, but boost players with NFL careers
    # Players with NFL games get priority at similar similarity levels
    for c in comps:
        nfl_bonus = min(5, (c.get("nfl_games") or 0) / 10)  # up to 5 pts for 50+ games
        c["_sort_score"] = c["similarity"] + nfl_bonus
    comps.sort(key=lambda c: c["_sort_score"], reverse=True)
    for c in comps:
        del c["_sort_score"]
    comps = comps[:limit]

    conn.close()
    return {
        "comps": comps,
        "prospect_name": target["player_name"],
        "prospect_percentiles": {mk: round(v, 1) for mk, v in target_pcts.items()},
    }


def fetch_prospect_tiers(position, draft_year=0):
    """Return prospects at a position grouped by athletic percentile tier."""
    conn = get_conn()

    if not draft_year:
        row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
        draft_year = row[0] if row and row[0] else 2025

    if not position:
        conn.close()
        return {"tiers": {}, "draft_year": draft_year, "position": position}

    pos = position.upper()

    # Get all prospects at this position for this draft year
    rows = conn.execute("""
        SELECT c.player_name, c.position, c.school, c.draft_year,
               c.draft_team, c.draft_round, c.draft_pick,
               c.height_inches, c.weight,
               c.forty, c.bench, c.vertical, c.broad_jump, c.cone, c.shuttle
        FROM combine_data c
        WHERE c.position = ? AND c.draft_year = ?
    """, (pos, draft_year)).fetchall()

    if not rows:
        conn.close()
        return {"tiers": {}, "draft_year": draft_year, "position": pos}

    # Get position-group stats for percentile computation
    metric_keys = ["forty", "bench", "vertical", "broad_jump", "cone", "shuttle"]
    metric_dirs = {"forty": "lower", "bench": "higher", "vertical": "higher",
                   "broad_jump": "higher", "cone": "lower", "shuttle": "lower"}

    pos_stats = {}
    for mk in metric_keys:
        all_rows = conn.execute(
            f"SELECT {mk} FROM combine_data WHERE position = ? AND {mk} IS NOT NULL", (pos,)
        ).fetchall()
        vals = [r[0] for r in all_rows]
        if vals:
            pos_stats[mk] = vals

    prospects = []
    for row in rows:
        p = dict(row)

        # Abbreviate team
        dt = (p.get("draft_team") or "").upper()
        p["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)

        # Height display
        ht = p.get("height_inches")
        p["height_display"] = f"{ht // 12}'{ht % 12}\"" if ht else None

        # Compute percentiles
        pcts = {}
        for mk in metric_keys:
            val = p.get(mk)
            if val is None or mk not in pos_stats:
                continue
            all_vals = pos_stats[mk]
            if metric_dirs[mk] == "lower":
                pct = sum(1 for v in all_vals if v > val) / len(all_vals) * 100
            else:
                pct = sum(1 for v in all_vals if v < val) / len(all_vals) * 100
            pcts[mk] = round(pct, 1)

        p["percentiles"] = pcts

        # Average athletic percentile (across available metrics)
        if pcts:
            p["avg_percentile"] = round(sum(pcts.values()) / len(pcts), 1)
        else:
            p["avg_percentile"] = None

        prospects.append(p)

    # Group into tiers
    tiers = {"elite": [], "above_avg": [], "average": [], "below_avg": [], "no_data": []}
    for p in prospects:
        avg = p["avg_percentile"]
        if avg is None:
            tiers["no_data"].append(p)
        elif avg >= 80:
            tiers["elite"].append(p)
        elif avg >= 60:
            tiers["above_avg"].append(p)
        elif avg >= 40:
            tiers["average"].append(p)
        else:
            tiers["below_avg"].append(p)

    # Sort within tiers by avg_percentile descending
    for tier in tiers.values():
        tier.sort(key=lambda x: x.get("avg_percentile") or 0, reverse=True)

    conn.close()
    return {"tiers": tiers, "draft_year": draft_year, "position": pos}


def fetch_prospects_compare(names, draft_year=0):
    """Return combine data + percentiles for multiple prospects (for comparison)."""
    conn = get_conn()

    if not draft_year:
        row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
        draft_year = row[0] if row and row[0] else 2025

    if not names:
        conn.close()
        return {"draft_year": draft_year, "prospects": []}

    results = []
    for name in names[:5]:  # max 5
        profile = fetch_prospect_profile(name, draft_year=draft_year)
        if profile.get("prospect"):
            results.append({
                "prospect": profile["prospect"],
                "percentiles": profile["percentiles"],
            })

    conn.close()
    return {"draft_year": draft_year, "prospects": results}


def fetch_prospect_scores(position="", draft_year=0):
    """Compute Razzle Prospect Score (RPS) for all prospects at a position.

    RPS = avg athletic percentile (60%) + draft capital value (30%) + size score (10%).
    """
    conn = get_conn()

    if not draft_year:
        row = conn.execute("SELECT MAX(draft_year) FROM combine_data").fetchone()
        draft_year = row[0] if row and row[0] else 2025

    pos_filter = "AND c.position = ?" if position else ""
    params = [draft_year] + ([position.upper()] if position else [])

    rows = conn.execute(f"""
        SELECT c.player_name, c.position, c.school, c.draft_year,
               c.draft_team, c.draft_round, c.draft_pick,
               c.height_inches, c.weight,
               c.forty, c.bench, c.vertical, c.broad_jump, c.cone, c.shuttle
        FROM combine_data c
        WHERE c.draft_year = ? {pos_filter}
    """, params).fetchall()

    if not rows:
        conn.close()
        return {"prospects": [], "draft_year": draft_year, "position": position.upper() if position else "ALL"}

    # Gather position-group stats for percentile computation
    metric_keys = ["forty", "bench", "vertical", "broad_jump", "cone", "shuttle"]
    metric_dirs = {"forty": "lower", "bench": "higher", "vertical": "higher",
                   "broad_jump": "higher", "cone": "lower", "shuttle": "lower"}

    # Get all positions we need stats for
    positions_in_data = set()
    for r in rows:
        positions_in_data.add(r["position"])

    pos_stats = {}
    for pos in positions_in_data:
        pos_stats[pos] = {}
        for mk in metric_keys:
            all_rows = conn.execute(
                f"SELECT {mk} FROM combine_data WHERE position = ? AND {mk} IS NOT NULL", (pos,)
            ).fetchall()
            vals = [r[0] for r in all_rows]
            if vals:
                pos_stats[pos][mk] = vals

    # Position-relative size benchmarks (median weight for the position)
    size_benchmarks = {}
    for pos in positions_in_data:
        wt_rows = conn.execute(
            "SELECT weight FROM combine_data WHERE position = ? AND weight IS NOT NULL", (pos,)
        ).fetchall()
        wts = sorted([r[0] for r in wt_rows])
        if wts:
            size_benchmarks[pos] = {"median": wts[len(wts)//2], "values": wts}

    prospects = []
    for row in rows:
        p = dict(row)
        pos = p["position"]

        # Abbreviate team
        dt = (p.get("draft_team") or "").upper()
        p["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)

        # Height display
        ht = p.get("height_inches")
        p["height_display"] = f"{ht // 12}'{ht % 12}\"" if ht else None

        # 1) Athletic percentiles
        pcts = {}
        for mk in metric_keys:
            val = p.get(mk)
            if val is None or mk not in pos_stats.get(pos, {}):
                continue
            all_vals = pos_stats[pos][mk]
            if metric_dirs[mk] == "lower":
                pct = sum(1 for v in all_vals if v > val) / len(all_vals) * 100
            else:
                pct = sum(1 for v in all_vals if v < val) / len(all_vals) * 100
            pcts[mk] = round(pct, 1)

        p["percentiles"] = pcts
        athletic_avg = round(sum(pcts.values()) / len(pcts), 1) if pcts else None
        p["athletic_avg"] = athletic_avg

        # 2) Draft capital score (0-100)
        rd = p.get("draft_round")
        pk = p.get("draft_pick")
        if rd and pk:
            # Pick 1 = 100, pick 32 = 75, pick 64 = 55, pick 256 = 20
            draft_capital = max(20, 100 - (pk - 1) * 0.314)
            draft_capital = round(min(100, draft_capital), 1)
        else:
            draft_capital = 20  # undrafted
        p["draft_capital_score"] = draft_capital

        # 3) Size score (position-relative, 0-100)
        wt = p.get("weight")
        if wt and pos in size_benchmarks:
            all_wts = size_benchmarks[pos]["values"]
            size_pct = sum(1 for w in all_wts if w < wt) / len(all_wts) * 100
            size_score = round(min(100, size_pct), 1)
        else:
            size_score = 50  # default median
        p["size_score"] = size_score

        # RPS composite: athletic 60% + draft capital 30% + size 10%
        if athletic_avg is not None:
            rps = round(athletic_avg * 0.6 + draft_capital * 0.3 + size_score * 0.1, 1)
        else:
            # No combine data — use draft capital + size only, penalize missing data
            rps = round(draft_capital * 0.5 + size_score * 0.2, 1)
        p["rps"] = rps

        prospects.append(p)

    # Sort by RPS descending
    prospects.sort(key=lambda x: x["rps"], reverse=True)

    # Add rank
    for i, p in enumerate(prospects):
        p["rank"] = i + 1

    conn.close()
    return {
        "prospects": prospects,
        "draft_year": draft_year,
        "position": position.upper() if position else "ALL",
    }


def fetch_draft_class_analytics(position=""):
    """Cross-year draft class strength analysis using RPS data.

    Returns per-year breakdown: count, avg RPS, tier distribution, top prospect, class grade.
    """
    conn = get_conn()

    # Get all available draft years
    years = [r[0] for r in conn.execute(
        "SELECT DISTINCT draft_year FROM combine_data ORDER BY draft_year ASC"
    ).fetchall()]

    if not years:
        conn.close()
        return {"classes": [], "position": position.upper() if position else "ALL"}

    # For each year, get RPS data via fetch_prospect_scores (reuse existing logic)
    conn.close()  # close before calling other functions

    classes = []
    for year in years:
        data = fetch_prospect_scores(position=position, draft_year=year)
        prospects = data.get("prospects", [])

        if not prospects:
            classes.append({
                "year": year, "count": 0, "avg_rps": 0,
                "tiers": {"elite": 0, "premium": 0, "solid": 0, "flier": 0},
                "top_prospect": None, "grade": "N/A"
            })
            continue

        rps_values = [p["rps"] for p in prospects]
        avg_rps = round(sum(rps_values) / len(rps_values), 1)

        # Tier distribution
        tiers = {"elite": 0, "premium": 0, "solid": 0, "flier": 0}
        for p in prospects:
            rps = p["rps"]
            if rps >= 85:
                tiers["elite"] += 1
            elif rps >= 70:
                tiers["premium"] += 1
            elif rps >= 55:
                tiers["solid"] += 1
            else:
                tiers["flier"] += 1

        # Top prospect
        top = prospects[0]  # already sorted by RPS desc
        top_prospect = {
            "name": top["player_name"],
            "position": top["position"],
            "rps": top["rps"],
            "school": top.get("school"),
        }

        # Class grade: elite ratio (% of class that is Elite/Premium) + avg RPS
        top_tier_pct = (tiers["elite"] + tiers["premium"]) / len(prospects) * 100
        if avg_rps >= 55 and top_tier_pct >= 15:
            grade = "A"
        elif avg_rps >= 50 or top_tier_pct >= 10:
            grade = "B"
        elif avg_rps >= 45 or top_tier_pct >= 5:
            grade = "C"
        else:
            grade = "D"

        classes.append({
            "year": year,
            "count": len(prospects),
            "avg_rps": avg_rps,
            "tiers": tiers,
            "top_prospect": top_prospect,
            "grade": grade,
        })

    return {
        "classes": classes,
        "position": position.upper() if position else "ALL",
    }


def fetch_players_compare(player_ids, season=0):
    """Return season aggregates for multiple players (for comparison)."""
    conn = get_conn()

    career_mode = str(season).lower() == "career"
    if not career_mode:
        season = int(season) if season else 0
        if not season:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            season = row[0] if row and row[0] else 2024

    if not player_ids:
        conn.close()
        return {"season": "career" if career_mode else season, "players": []}

    placeholders = ",".join("?" * len(player_ids))
    season_filter = "" if career_mode else "AND s.season = ?"
    query_params = list(player_ids) if career_mode else list(player_ids) + [season]

    rows = conn.execute(f"""
        SELECT
            p.player_id, p.full_name, p.position, p.team, p.age, p.college,
            COUNT(*) as games,
            COUNT(DISTINCT s.season) as seasons,
            {_STAT_SUM_COLS}
        FROM players p
        JOIN player_week_stats s ON p.player_id = s.player_id
        WHERE p.player_id IN ({placeholders}) {season_filter}
        GROUP BY p.player_id
    """, query_params).fetchall()

    players = []
    for r in rows:
        item = dict(r)
        g = item["games"] or 1
        item["ppg"] = round((item["fantasy_points_ppr"] or 0) / g, 1)
        players.append(item)

    conn.close()
    return {"season": "career" if career_mode else season, "players": players}


# ---------------------------------------------------------------------------
# College production stats (cfbfastR data)
# ---------------------------------------------------------------------------

def _enrich_college_derived(items):
    """Add derived efficiency stats to college player rows."""
    for item in items:
        g = item.get("games") or 1
        item["completion_pct"] = _safe_div((item.get("completions") or 0) * 100, item.get("pass_attempts") or 0)
        item["yards_per_carry"] = _safe_div(item.get("rush_yards") or 0, item.get("carries") or 0)
        item["yards_per_rec"] = _safe_div(item.get("rec_yards") or 0, item.get("receptions") or 0)
        item["yards_per_target"] = _safe_div(item.get("rec_yards") or 0, item.get("targets") or 0)
        item["catch_rate"] = _safe_div((item.get("receptions") or 0) * 100, item.get("targets") or 0)
        item["yards_per_att"] = _safe_div(item.get("pass_yards") or 0, item.get("pass_attempts") or 0)
        item["pass_ypg"] = _safe_div(item.get("pass_yards") or 0, g)
        item["rush_ypg"] = _safe_div(item.get("rush_yards") or 0, g)
        item["rec_ypg"] = _safe_div(item.get("rec_yards") or 0, g)
        item["total_ypg"] = _safe_div(item.get("total_yards") or 0, g)
        item["tds_per_game"] = _safe_div(item.get("total_tds") or 0, g)
    return items


def fetch_college_players(
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
    conn = get_conn()

    # Default to latest season
    if not season:
        row = conn.execute("SELECT MAX(season) FROM cfb_player_season_stats").fetchone()
        season = row[0] if row and row[0] else 2024

    # Position list
    pos_list = []
    if positions:
        pos_list = [p.strip().upper() for p in positions.split(",") if p.strip()]
    elif position:
        pos_list = [position.strip().upper()]

    where = ["c.season = ?"]
    params = [season]

    if search:
        search_clean = search.lower().replace(" ", "")
        where.append("LOWER(REPLACE(c.player_name, ' ', '')) LIKE ?")
        params.append(f"%{search_clean}%")

    if pos_list:
        placeholders = ",".join("?" * len(pos_list))
        where.append(f"c.position IN ({placeholders})")
        params.extend(pos_list)

    if team:
        where.append("c.team LIKE ?")
        params.append(f"%{team}%")

    if conference:
        where.append("c.conference LIKE ?")
        params.append(f"%{conference}%")

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

    conn.close()
    return {"count": total, "season": season, "items": items}


def fetch_college_player_profile(player_id):
    """Return a rich college player profile with all seasons + combine/draft data."""
    conn = get_conn()

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
        conn.close()
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

    # Try to match with combine data (by normalized name + position)
    name_clean = latest["player_name"].lower().replace(" ", "")
    combine_row = conn.execute("""
        SELECT player_name, position, school, draft_year,
               height_inches, weight,
               forty, bench, vertical, broad_jump, cone, shuttle,
               draft_team, draft_round, draft_pick, pfr_id
        FROM combine_data
        WHERE LOWER(REPLACE(player_name, ' ', '')) = ?
        ORDER BY draft_year DESC LIMIT 1
    """, (name_clean,)).fetchone()

    combine = None
    if combine_row:
        combine = dict(combine_row)
        ht = combine.get("height_inches")
        if ht:
            combine["height_display"] = f"{ht // 12}'{ht % 12}\""
        dt = (combine.get("draft_team") or "").upper()
        combine["draft_team"] = TEAM_ABBREV.get(dt, dt[:3] if dt else None)

    # Try to match with draft picks
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
    """, (name_clean,)).fetchone()

    draft = dict(draft_row) if draft_row else None

    conn.close()
    return {
        "player": player,
        "seasons": season_items,
        "career": career,
        "combine": combine,
        "draft": draft,
    }


def fetch_college_filter_options():
    """Return available filter values for the college screener."""
    conn = get_conn()

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

    conn.close()
    return {"seasons": seasons, "teams": teams, "conferences": conferences, "positions": positions}


# ---------------------------------------------------------------------------
# Waitlist
# ---------------------------------------------------------------------------

def init_waitlist_table():
    conn = get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS waitlist (
            email TEXT UNIQUE NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()


def add_to_waitlist(email: str) -> dict:
    import re
    email = email.strip().lower()
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        return {"status": "error", "message": "invalid email format"}
    conn = get_conn()
    try:
        conn.execute("INSERT INTO waitlist (email) VALUES (?)", (email,))
        conn.commit()
        result = {"status": "ok"}
    except sqlite3.IntegrityError:
        result = {"status": "duplicate"}
    conn.close()
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

    conn = get_conn()

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

    conn.close()
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

    conn = get_conn()

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
        conn.close()
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

    conn.close()

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
    conn = get_conn()
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
    conn.close()


def publish_formula(name: str, description: str, position_tags: list,
                    stat_weights: dict, creator_name: str) -> dict:
    import json
    conn = get_conn()
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
    conn.close()
    return result


def fetch_formula_store(position: str = "", sort: str = "newest",
                        search: str = "", limit: int = 50, offset: int = 0) -> dict:
    import json
    conn = get_conn()

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
    conn.close()

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
    conn = get_conn()
    row = conn.execute(
        "SELECT id, name, description, position_tags, stat_weights, creator_name, created_at, rating_sum, rating_count FROM formula_store WHERE id = ?",
        (formula_id,),
    ).fetchone()
    conn.close()

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

    conn = get_conn()
    # Check formula exists
    exists = conn.execute("SELECT id FROM formula_store WHERE id = ?", (formula_id,)).fetchone()
    if not exists:
        conn.close()
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
    conn.close()
    return {"status": "ok"}
