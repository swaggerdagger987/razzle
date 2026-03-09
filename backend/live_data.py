"""
Razzle data layer — all SQLite queries for the API.
server.py calls these functions; they return dicts ready for JSON.
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"

FANTASY_POSITIONS = {"QB", "RB", "WR", "TE"}

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

    query = f"""
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
        WHERE {where_clause}
        ORDER BY {nulls_clause} {order_expr} {sort_dir}
        LIMIT ? OFFSET ?
    """
    params.extend([limit, offset])

    rows = conn.execute(query, params).fetchall()

    # Count
    count_query = f"""
        SELECT COUNT(*)
        FROM combine_data c
        LEFT JOIN draft_picks d
            ON c.draft_year = d.season
            AND LOWER(REPLACE(c.player_name, ' ', '')) = LOWER(REPLACE(d.player_name, ' ', ''))
            AND c.position = d.position
        WHERE {where_clause}
    """
    total = conn.execute(count_query, params[:-2]).fetchone()[0]

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

    conn.close()
    return {"count": total, "draft_year": draft_year, "items": items}


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


def fetch_players_compare(player_ids, season=0):
    """Return season aggregates for multiple players (for comparison)."""
    conn = get_conn()

    if not season:
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        season = row[0] if row and row[0] else 2024

    if not player_ids:
        conn.close()
        return {"season": season, "players": []}

    placeholders = ",".join("?" * len(player_ids))
    rows = conn.execute(f"""
        SELECT
            p.player_id, p.full_name, p.position, p.team, p.age, p.college,
            COUNT(*) as games,
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
            SUM(s.receiving_yards_after_catch) as receiving_yards_after_catch
        FROM players p
        JOIN player_week_stats s ON p.player_id = s.player_id
        WHERE p.player_id IN ({placeholders}) AND s.season = ?
        GROUP BY p.player_id
    """, (*player_ids, season)).fetchall()

    players = []
    for r in rows:
        item = dict(r)
        g = item["games"] or 1
        item["ppg"] = round((item["fantasy_points_ppr"] or 0) / g, 1)
        players.append(item)

    conn.close()
    return {"season": season, "players": players}
