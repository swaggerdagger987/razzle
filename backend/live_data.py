"""
Razzle data layer — all SQLite queries for the API.
server.py calls these functions; they return dicts ready for JSON.
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"

FANTASY_POSITIONS = {"QB", "RB", "WR", "TE"}


def get_conn():
    conn = sqlite3.connect(str(DB_PATH), timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


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

    # Determine season
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
        "full_name", "position", "team", "games",
    }
    if sort_key not in safe_sorts:
        sort_key = "fantasy_points_ppr"
    if sort_dir.lower() not in ("asc", "desc"):
        sort_dir = "desc"

    where = ["s.season = ?"]
    params = [season]

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

    where_clause = " AND ".join(where)

    query = f"""
        SELECT
            p.player_id, p.full_name, p.position, p.team, p.age, p.college,
            COUNT(*) as games,
            SUM(s.fantasy_points_ppr) as fantasy_points_ppr,
            SUM(s.fantasy_points_half_ppr) as fantasy_points_half_ppr,
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
            SUM(s.receiving_yards_after_catch) as receiving_yards_after_catch
        FROM players p
        JOIN player_week_stats s ON p.player_id = s.player_id
        WHERE {where_clause}
        GROUP BY p.player_id
        ORDER BY {sort_key} {sort_dir}
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

    items = []
    for r in rows:
        item = dict(r)
        # Per-game averages for key stats
        g = item["games"] or 1
        item["ppg"] = round((item["fantasy_points_ppr"] or 0) / g, 1)
        items.append(item)

    conn.close()
    return {"count": total, "season": season, "items": items}


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

    where = ["s.season = ?"]
    params = [season]

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

    where_clause = " AND ".join(where)

    # Safe sort
    safe_sorts = {
        "fantasy_points_ppr", "fantasy_points_half_ppr", "fantasy_points_std",
        "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
        "receiving_yards", "receiving_tds", "receptions", "touchdowns",
        "turnovers", "targets", "carries", "games", "ppg",
        "full_name", "position", "team",
    }
    if sort_key not in safe_sorts:
        sort_key = "fantasy_points_ppr"
    if sort_dir.lower() not in ("asc", "desc"):
        sort_dir = "desc"

    # Build having clause for advanced filters
    having = []
    ops = {"gt": ">", "gte": ">=", "lt": "<", "lte": "<=", "eq": "=", "neq": "!="}
    for f in filters:
        key = f.get("key", "")
        op = ops.get(f.get("op", ""), None)
        val = f.get("value")
        if not key or not op or val is None:
            continue
        # Only allow known aggregate columns
        if key in safe_sorts and key not in ("full_name", "position", "team"):
            if key == "ppg":
                having.append(f"(SUM(s.fantasy_points_ppr) / MAX(1, COUNT(*))) {op} ?")
            elif key == "games":
                having.append(f"COUNT(*) {op} ?")
            else:
                having.append(f"SUM(s.{key}) {op} ?")
            params.append(float(val))

    having_clause = ""
    if having:
        having_clause = "HAVING " + " AND ".join(having)

    # Handle ppg sort
    order_expr = sort_key
    if sort_key == "ppg":
        order_expr = "(SUM(s.fantasy_points_ppr) / MAX(1, COUNT(*)))"
    elif sort_key == "games":
        order_expr = "COUNT(*)"
    elif sort_key in ("full_name", "position", "team"):
        order_expr = f"p.{sort_key}"
    else:
        order_expr = f"SUM(s.{sort_key})"

    query = f"""
        SELECT
            p.player_id, p.full_name, p.position, p.team, p.age, p.college,
            COUNT(*) as games,
            SUM(s.fantasy_points_ppr) as fantasy_points_ppr,
            SUM(s.fantasy_points_half_ppr) as fantasy_points_half_ppr,
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
            SUM(s.receiving_yards_after_catch) as receiving_yards_after_catch
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

    items = []
    for r in rows:
        item = dict(r)
        g = item["games"] or 1
        item["ppg"] = round((item["fantasy_points_ppr"] or 0) / g, 1)
        items.append(item)

    conn.close()
    return {"count": total, "season": season, "items": items}


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
