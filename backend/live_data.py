"""
Razzle data layer — all SQLite queries for the API.
server.py calls these functions; they return dicts ready for JSON.
"""

import math
import sqlite3
import statistics
import time as _time
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"

# Simple in-memory cache for stable endpoints (filter options, featured)
_cache = {}
_CACHE_TTL = 300  # 5 minutes


def _cached(key, fn):
    """Return cached result or compute and cache."""
    now = _time.time()
    if key in _cache and now - _cache[key]["t"] < _CACHE_TTL:
        return _cache[key]["v"]
    result = fn()
    _cache[key] = {"t": now, "v": result}
    return result

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

# Reverse mapping: abbreviation → full team name (current names only)
ABBREV_TO_TEAM = {
    "ARI": "Arizona Cardinals", "ATL": "Atlanta Falcons", "BAL": "Baltimore Ravens",
    "BUF": "Buffalo Bills", "CAR": "Carolina Panthers", "CHI": "Chicago Bears",
    "CIN": "Cincinnati Bengals", "CLE": "Cleveland Browns", "DAL": "Dallas Cowboys",
    "DEN": "Denver Broncos", "DET": "Detroit Lions", "GB": "Green Bay Packers",
    "HOU": "Houston Texans", "IND": "Indianapolis Colts", "JAX": "Jacksonville Jaguars",
    "KC": "Kansas City Chiefs", "LV": "Las Vegas Raiders", "LAC": "Los Angeles Chargers",
    "LAR": "Los Angeles Rams", "MIA": "Miami Dolphins", "MIN": "Minnesota Vikings",
    "NE": "New England Patriots", "NO": "New Orleans Saints", "NYG": "New York Giants",
    "NYJ": "New York Jets", "PHI": "Philadelphia Eagles", "PIT": "Pittsburgh Steelers",
    "SF": "San Francisco 49ers", "SEA": "Seattle Seahawks", "TB": "Tampa Bay Buccaneers",
    "TEN": "Tennessee Titans", "WAS": "Washington Commanders",
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

        # Passer Rating (NFL formula)
        att = item.get("attempts") or 0
        if att > 0:
            comp = item.get("completions") or 0
            p_yds = item.get("passing_yards") or 0
            p_td = item.get("passing_tds") or 0
            ints = item.get("interceptions") or 0
            a = max(0, min(2.375, ((comp / att) - 0.3) * 5))
            b = max(0, min(2.375, ((p_yds / att) - 3) * 0.25))
            c = max(0, min(2.375, (p_td / att) * 20))
            d = max(0, min(2.375, 2.375 - ((ints / att) * 25)))
            item["passer_rating"] = round(((a + b + c + d) / 6) * 100, 1)
            # Adjusted Yards per Attempt
            item["ay_per_att"] = round((p_yds + 20 * p_td - 45 * ints) / att, 1)
        else:
            item["passer_rating"] = None
            item["ay_per_att"] = None

        # TD Rate: total TDs / (carries + targets)
        car = item.get("carries") or 0
        tgt = item.get("targets") or 0
        total_opps = car + tgt
        tds = item.get("touchdowns") or 0
        item["td_rate"] = round(tds / total_opps * 100, 1) if total_opps > 0 else None

        # Fumble Rate: fumbles_lost / (carries + receptions)
        rec = item.get("receptions") or 0
        fl = item.get("fumbles_lost") or 0
        touch_opps = car + rec
        item["fumble_rate"] = round(fl / touch_opps * 100, 1) if touch_opps > 0 else None

        # Points Per First Down scoring: standard + 1pt per first down
        pass_fd = item.get("passing_first_downs") or 0
        rush_fd = item.get("rushing_first_downs") or 0
        rec_fd = item.get("receiving_first_downs") or 0
        total_fd = pass_fd + rush_fd + rec_fd
        std_pts = item.get("fantasy_points_ppr") or 0
        if total_fd > 0:
            item["ppfd"] = round(std_pts + total_fd, 1)
            item["ppfd_per_game"] = _safe_div(item["ppfd"], g)
        else:
            item["ppfd"] = None
            item["ppfd_per_game"] = None

        # YPRR approximation: receiving_yards / (snap_count * 0.85)
        # WR/TE only. Uses offense_snaps if available, else games * 45 as estimate
        pos = (item.get("position") or "").upper()
        if pos in ("WR", "TE"):
            snaps = item.get("offense_snaps") or 0
            if snaps < 1:
                snaps = g * 45  # rough estimate
            routes_est = snaps * 0.85
            item["yprr"] = round((item.get("receiving_yards") or 0) / routes_est, 2) if routes_est > 0 else None
        else:
            item["yprr"] = None

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
        # WOPR per game (wopr is populated by _enrich_with_rate_metrics)
        wopr_val = item.get("wopr")
        item["wopr_per_game"] = round(wopr_val / g, 3) if wopr_val and g > 0 else None
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


def _enrich_with_pbp_stats(conn, items, season=None, career_mode=False):
    """Fetch play-by-play derived stats from player_season_pbp table."""
    if not items:
        return items

    player_ids = [item["player_id"] for item in items if item.get("player_id")]
    if not player_ids:
        return items

    # Check if table exists
    table_check = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='player_season_pbp'"
    ).fetchone()
    if not table_check:
        return items

    placeholders = ",".join(["?"] * len(player_ids))

    if career_mode:
        query = f"""
            SELECT player_id,
                AVG(pass_success_rate) as pass_success_rate,
                AVG(rush_success_rate) as rush_success_rate,
                SUM(total_ryoe) as total_ryoe,
                AVG(ryoe_per_carry) as ryoe_per_carry,
                AVG(avg_score_differential) as avg_score_differential,
                SUM(play_action_attempts) as play_action_attempts,
                SUM(play_action_completions) as play_action_completions,
                SUM(play_action_yards) as play_action_yards,
                SUM(play_action_tds) as play_action_tds,
                SUM(scramble_attempts) as scramble_attempts,
                SUM(scramble_yards) as scramble_yards,
                SUM(scramble_tds) as scramble_tds,
                AVG(garbage_time_pct) as garbage_time_pct,
                SUM(gl_carries) as gl_carries,
                SUM(gl_targets) as gl_targets,
                SUM(gl_tds) as gl_tds,
                SUM(two_point_conversions) as two_point_conversions,
                SUM(return_yards) as return_yards,
                SUM(return_tds) as return_tds,
                SUM(intended_air_yards) as intended_air_yards,
                AVG(intended_air_yards_per_target) as intended_air_yards_per_target,
                SUM(drops) as drops,
                AVG(drop_rate) as drop_rate
            FROM player_season_pbp
            WHERE player_id IN ({placeholders})
            GROUP BY player_id
        """
        params = player_ids
    else:
        query = f"""
            SELECT * FROM player_season_pbp
            WHERE player_id IN ({placeholders}) AND season = ?
        """
        params = player_ids + [season]

    pbp_map = {}
    for row in conn.execute(query, params):
        pbp_map[row["player_id"]] = dict(row)

    pbp_cols = [
        "pass_success_rate", "rush_success_rate", "total_ryoe", "ryoe_per_carry",
        "avg_score_differential", "play_action_attempts", "play_action_completions",
        "play_action_yards", "play_action_tds", "scramble_attempts", "scramble_yards",
        "scramble_tds", "garbage_time_pct", "gl_carries", "gl_targets", "gl_tds",
        "two_point_conversions", "return_yards", "return_tds",
        "intended_air_yards", "intended_air_yards_per_target", "drops", "drop_rate",
        "bye_week", "games_missed",
    ]

    for item in items:
        pid = item.get("player_id")
        pbp = pbp_map.get(pid, {})
        for col in pbp_cols:
            val = pbp.get(col)
            if val is not None:
                item[col] = round(val, 3) if isinstance(val, float) else val
            else:
                item[col] = None

    return items


def _enrich_with_team_shares(conn, items, season=None, career_mode=False):
    """Compute team-relative share stats: dominator rating, rush share."""
    if not items:
        return items

    # Collect unique team/season pairs from result set
    teams_needed = set()
    for item in items:
        team = item.get("team")
        if team:
            teams_needed.add(team)

    if not teams_needed:
        for item in items:
            item["dominator_rating"] = None
            item["rush_share"] = None
        return items

    # Query team totals from player_week_stats
    team_placeholders = ",".join("?" * len(teams_needed))
    team_list = list(teams_needed)

    if career_mode:
        team_query = f"""
            SELECT p.team,
                   SUM(s.receiving_yards) as team_rec_yds,
                   SUM(s.receiving_tds) as team_rec_tds,
                   SUM(s.carries) as team_carries
            FROM players p
            JOIN player_week_stats s ON p.player_id = s.player_id
            WHERE p.team IN ({team_placeholders})
            GROUP BY p.team
        """
        team_rows = conn.execute(team_query, team_list).fetchall()
        team_map = {}
        for r in team_rows:
            team_map[r[0]] = {"rec_yds": r[1] or 0, "rec_tds": r[2] or 0, "carries": r[3] or 0}
    else:
        s = int(season) if season else 0
        if not s:
            row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
            s = row[0] if row and row[0] else 2024
        team_query = f"""
            SELECT p.team,
                   SUM(s.receiving_yards) as team_rec_yds,
                   SUM(s.receiving_tds) as team_rec_tds,
                   SUM(s.carries) as team_carries
            FROM players p
            JOIN player_week_stats s ON p.player_id = s.player_id
            WHERE p.team IN ({team_placeholders}) AND s.season = ?
            GROUP BY p.team
        """
        team_rows = conn.execute(team_query, team_list + [s]).fetchall()
        team_map = {}
        for r in team_rows:
            team_map[r[0]] = {"rec_yds": r[1] or 0, "rec_tds": r[2] or 0, "carries": r[3] or 0}

    for item in items:
        team = item.get("team")
        pos = (item.get("position") or "").upper()
        totals = team_map.get(team, {})

        # Dominator Rating: (rec_yds + rec_tds*20) / (team_rec_yds + team_rec_tds*20)
        # Only meaningful for WR/TE
        if pos in ("WR", "TE") and totals.get("rec_yds"):
            player_val = (item.get("receiving_yards") or 0) + (item.get("receiving_tds") or 0) * 20
            team_val = totals["rec_yds"] + totals["rec_tds"] * 20
            item["dominator_rating"] = round(player_val / team_val, 3) if team_val > 0 else None
        else:
            item["dominator_rating"] = None

        # Rush Share: player carries / team carries
        # Only meaningful for RB/QB
        if pos in ("RB", "QB") and totals.get("carries"):
            item["rush_share"] = round((item.get("carries") or 0) / totals["carries"] * 100, 1) if totals["carries"] > 0 else None
        else:
            item["rush_share"] = None

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


def quick_search_players(query, limit=8):
    """Lightweight player search for command palette — hits players table + latest PPG."""
    if not query or not query.strip():
        return []
    limit = max(1, min(limit, 20))
    conn = get_conn()
    search_term = "%" + query.lower().replace(" ", "") + "%"
    rows = conn.execute("""
        SELECT p.player_id, p.full_name, p.position, p.team, p.headshot_url,
               COALESCE(
                   (SELECT ROUND(SUM(s.fantasy_points_ppr) * 1.0 / COUNT(DISTINCT s.week), 1)
                    FROM player_week_stats s
                    WHERE s.player_id = p.player_id
                      AND s.season = (SELECT MAX(season) FROM player_week_stats)),
                   0) AS ppg
        FROM players p
        WHERE p.search_name LIKE ?
          AND p.position IN ('QB', 'RB', 'WR', 'TE')
        ORDER BY ppg DESC
        LIMIT ?
    """, (search_term, limit)).fetchall()
    return [dict(r) for r in rows]


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
            p.player_id, p.full_name, p.position, p.team, p.age, p.college, p.headshot_url,
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
    _enrich_with_team_shares(conn, items, season=season, career_mode=career_mode)
    _enrich_with_pbp_stats(conn, items, season=season, career_mode=career_mode)

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
    # Explicit mapping from filter key to SQL expression (no f-string interpolation)
    FILTER_COLUMN_MAP = {
        "ppg": "(SUM(s.fantasy_points_ppr) / MAX(1, COUNT(*)))",
        "games": "COUNT(*)",
        "seasons": "COUNT(DISTINCT s.season)",
        "fantasy_points_ppr": "SUM(s.fantasy_points_ppr)",
        "completions": "SUM(s.completions)",
        "pass_attempts": "SUM(s.attempts)",
        "passing_yards": "SUM(s.passing_yards)",
        "passing_tds": "SUM(s.passing_tds)",
        "interceptions": "SUM(s.interceptions)",
        "carries": "SUM(s.carries)",
        "rushing_yards": "SUM(s.rushing_yards)",
        "rushing_tds": "SUM(s.rushing_tds)",
        "targets": "SUM(s.targets)",
        "receptions": "SUM(s.receptions)",
        "receiving_yards": "SUM(s.receiving_yards)",
        "receiving_tds": "SUM(s.receiving_tds)",
        "total_tds": "SUM(s.touchdowns)",
        "turnovers": "SUM(s.turnovers)",
        "sacks_taken": "SUM(s.sacks_taken)",
        "sack_yards_lost": "SUM(s.sack_yards_lost)",
        "fumbles": "SUM(s.fumbles)",
        "fumbles_lost": "SUM(s.fumbles_lost)",
        "offense_snaps": "SUM(s.offense_snaps)",
    }

    having = []
    ops = {"gt": ">", "gte": ">=", "lt": "<", "lte": "<=", "eq": "=", "neq": "!="}
    for f in filters:
        key = f.get("key", "")
        op = ops.get(f.get("op", ""), None)
        val = f.get("value")
        if not key or not op or val is None:
            continue
        sql_expr = FILTER_COLUMN_MAP.get(key)
        if sql_expr:
            having.append(f"{sql_expr} {op} ?")
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
            p.player_id, p.full_name, p.position, p.team, p.age, p.college, p.headshot_url,
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
    _enrich_with_team_shares(conn, items, season=season, career_mode=career_mode)
    _enrich_with_pbp_stats(conn, items, season=season, career_mode=career_mode)

    # Re-sort in Python if sorting by a derived/rate metric
    if python_sort:
        reverse = sort_dir.lower() == "desc"
        items.sort(key=lambda x: x.get(sort_key) or 0, reverse=reverse)

    conn.close()
    return {"count": total, "season": "career" if career_mode else season, "items": items}


def get_filter_options():
    """Return available positions, teams, and stat columns for autocomplete."""
    def _query():
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
    return _cached("filter_options", _query)


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
        "SELECT player_id, full_name, position, team, age, college, headshot_url FROM players WHERE player_id = ?",
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
        "SELECT player_id, full_name, position, team, age, college, headshot_url FROM players WHERE player_id = ?",
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
    import datetime as _dt
    conn = get_conn()

    _cur_year = _dt.datetime.now().year
    if not draft_year or draft_year < 2000 or draft_year > _cur_year + 2:
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

    # Collect all name variants for the prospects being enriched
    all_name_keys = set()
    for item in items:
        name = item.get("player_name", "")
        if name:
            all_name_keys.update(_name_variants(name))

    if not all_name_keys:
        return

    # Build a lookup of college career totals only for relevant names
    placeholders = ",".join("?" for _ in all_name_keys)
    all_college = conn.execute(f"""
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
        WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(player_name, ' ', ''), '.', ''), '''', ''), '-', '')) IN ({placeholders})
        GROUP BY name_key
    """, list(all_name_keys)).fetchall()

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
        "SELECT player_id, full_name, position, team, age, college, headshot_url FROM players WHERE player_id = ?",
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

    try:
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

        return {
            "prospects": prospects,
            "draft_year": draft_year,
            "position": position.upper() if position else "ALL",
        }
    finally:
        conn.close()


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
            p.player_id, p.full_name, p.position, p.team, p.age, p.college, p.headshot_url,
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

    # Seed formulas if table is empty
    count = conn.execute("SELECT COUNT(*) FROM formula_store").fetchone()[0]
    if count == 0:
        _seed_formula_store(conn)

    conn.close()


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


# ---------------------------------------------------------------------------
# Analytics — lightweight page view tracking
# ---------------------------------------------------------------------------

def _init_analytics_table():
    conn = get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS pageviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()


def log_pageview(page: str):
    try:
        conn = get_conn()
        conn.execute("INSERT INTO pageviews (page) VALUES (?)", (page[:200],))
        conn.commit()
        conn.close()
    except Exception:
        pass


def get_analytics_summary() -> dict:
    try:
        conn = get_conn()
        total = conn.execute("SELECT COUNT(*) FROM pageviews").fetchone()[0]
        by_page = conn.execute(
            "SELECT page, COUNT(*) as views FROM pageviews GROUP BY page ORDER BY views DESC LIMIT 20"
        ).fetchall()
        by_day = conn.execute(
            "SELECT DATE(created_at) as day, COUNT(*) as views FROM pageviews GROUP BY day ORDER BY day DESC LIMIT 30"
        ).fetchall()
        conn.close()
        return {
            "total": total,
            "by_page": [{"page": r[0], "views": r[1]} for r in by_page],
            "by_day": [{"day": r[0], "views": r[1]} for r in by_day],
        }
    except Exception:
        return {"total": 0, "by_page": [], "by_day": []}


# ---------------------------------------------------------------------------
# Trade Value Model
# ---------------------------------------------------------------------------
# Trade value = composite of:
#   1. PPR points per game (production) — 50% weight
#   2. Age depreciation curve (youth premium) — 30% weight
#   3. Positional scarcity (replacement-level gap) — 20% weight
# Output: 0-100 scale where 100 = elite dynasty asset

# Peak age and decline rate by position
_AGE_PEAKS = {"QB": 28, "RB": 24, "WR": 26, "TE": 27}
_AGE_DECAY = {"QB": 0.04, "RB": 0.10, "WR": 0.06, "TE": 0.05}

# PPR PPG thresholds for elite (100th percentile) by position
_ELITE_PPG = {"QB": 22.0, "RB": 18.0, "WR": 18.0, "TE": 14.0}

# Positional scarcity multipliers (higher = scarcer = more valuable)
_SCARCITY = {"QB": 0.85, "RB": 1.15, "WR": 1.0, "TE": 0.90}


def _age_value(age, position):
    """Age curve: 100 at/before peak, decays after. Youth gets slight premium."""
    if not age or not position:
        return 50.0
    peak = _AGE_PEAKS.get(position, 26)
    decay = _AGE_DECAY.get(position, 0.06)
    if age <= peak:
        # Youth premium: younger than peak gets a small boost
        return min(100.0, 100.0 + (peak - age) * 2.0)
    else:
        years_past = age - peak
        return max(0.0, 100.0 * math.exp(-decay * years_past * years_past))


def _production_value(ppg, position):
    """Production score: PPR PPG normalized to 0-100 vs positional elite threshold."""
    if not ppg or ppg <= 0:
        return 0.0
    elite = _ELITE_PPG.get(position, 16.0)
    return min(100.0, (ppg / elite) * 100.0)


def _scarcity_value(position):
    """Positional scarcity multiplier normalized to 0-100 base."""
    return _SCARCITY.get(position, 1.0) * 100.0


def compute_trade_value(ppg, age, position):
    """Composite trade value on 0-100 scale."""
    prod = _production_value(ppg, position)
    age_v = _age_value(age, position)
    scar = _scarcity_value(position)
    # Weighted composite: production 50%, age 30%, scarcity 20%
    raw = prod * 0.50 + age_v * 0.30 + scar * 0.20
    # Normalize: scarcity base is ~100, so raw max is ~100
    return round(min(100.0, max(0.0, raw)), 1)


def fetch_trade_values(player_ids):
    """Return trade values for a list of player IDs."""
    if not player_ids:
        return []

    conn = get_conn()

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
    conn.close()

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


# ---------------------------------------------------------------------------
# Draft Pick Trade Values
# ---------------------------------------------------------------------------

def _pick_value(overall_pick):
    """Dynasty draft pick value on 0-100 scale using exponential decay.

    1.01 (overall 1) ≈ 88, mid-1st ≈ 70, late-1st ≈ 55,
    early-2nd ≈ 42, mid-3rd ≈ 15, late-4th ≈ 3.
    """
    # Exponential decay: V = A * e^(-k * (pick-1))
    # Calibrated so pick 1 = 88, pick 12 = 55, pick 48 = 3
    A = 88.0
    k = 0.070
    val = A * math.exp(-k * (overall_pick - 1))
    return round(max(1.0, val), 1)


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


# ---------------------------------------------------------------------------
# Roster Value Calculator
# ---------------------------------------------------------------------------

# Benchmark total roster values for grading (based on typical 12-team dynasty)
_GRADE_THRESHOLDS = [
    (600, "A+"), (520, "A"), (460, "A-"),
    (400, "B+"), (350, "B"), (300, "B-"),
    (250, "C+"), (210, "C"), (170, "C-"),
    (130, "D+"), (100, "D"), (70, "D-"),
]


def _roster_grade(total_value):
    """Letter grade based on total roster trade value."""
    for threshold, grade in _GRADE_THRESHOLDS:
        if total_value >= threshold:
            return grade
    return "F"


def _competing_status(avg_age, total_value):
    """Determine roster window: competing, retooling, or rebuilding."""
    if total_value >= 350 and avg_age <= 27.5:
        return "competing"
    if total_value >= 300 and avg_age <= 28.5:
        return "competing"
    if total_value >= 250 and avg_age <= 26.5:
        return "competing"
    if total_value < 200:
        return "rebuilding"
    if avg_age > 28.5:
        return "rebuilding"
    return "retooling"


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


# ---------------------------------------------------------------------------
# Dynasty Rankings Board
# ---------------------------------------------------------------------------

_TIER_LABELS = {
    1: "Elite",
    2: "Star",
    3: "Starter",
    4: "Solid",
    5: "Bench",
    6: "Depth",
    7: "Flier",
    8: "Deep Stash",
}


def _assign_tier(value):
    """Assign dynasty tier 1-8 based on trade value score."""
    if value >= 90:
        return 1
    elif value >= 80:
        return 2
    elif value >= 70:
        return 3
    elif value >= 60:
        return 4
    elif value >= 50:
        return 5
    elif value >= 40:
        return 6
    elif value >= 30:
        return 7
    else:
        return 8


def fetch_dynasty_rankings(position=None, limit=200):
    """Return top dynasty-relevant players ranked by dynasty value with tiers."""
    limit = max(1, min(300, limit))
    conn = get_conn()

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
    conn.close()

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
    conn = get_conn()

    try:
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
    finally:
        conn.close()

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
    conn = get_conn()

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
    conn.close()
    return results


# ---------------------------------------------------------------------------
# Player Comp Finder — cosine similarity on production profiles
# ---------------------------------------------------------------------------

# Position-specific stat vectors for similarity comparison (per-game rates)
_COMP_STATS = {
    "QB": ["pass_ypg", "passing_tds_pg", "comp_pct", "yards_per_att", "rushing_yards_pg", "rushing_tds_pg", "turnovers_pg", "ppg"],
    "RB": ["rush_ypg", "yards_per_carry", "rushing_tds_pg", "rec_ypg", "receptions_pg", "targets_pg", "ppg", "td_rate"],
    "WR": ["rec_ypg", "receptions_pg", "yards_per_rec", "targets_pg", "receiving_tds_pg", "catch_rate", "ppg", "td_rate"],
    "TE": ["rec_ypg", "receptions_pg", "yards_per_rec", "targets_pg", "receiving_tds_pg", "catch_rate", "ppg", "td_rate"],
}

_COMP_STAT_LABELS = {
    "pass_ypg": "Pass YPG", "passing_tds_pg": "Pass TD/G", "comp_pct": "Comp%",
    "yards_per_att": "Y/A", "rushing_yards_pg": "Rush YPG", "rushing_tds_pg": "Rush TD/G",
    "turnovers_pg": "TO/G", "ppg": "PPR PPG", "rush_ypg": "Rush YPG",
    "yards_per_carry": "Y/C", "rec_ypg": "Rec YPG", "receptions_pg": "Rec/G",
    "yards_per_rec": "Y/R", "targets_pg": "Tgt/G", "receiving_tds_pg": "Rec TD/G",
    "catch_rate": "Catch%", "td_rate": "TD%",
}


def _build_stat_vector(row, stat_keys):
    """Build a stat vector from a player row dict. Returns list of floats."""
    g = row.get("games") or 1
    vals = []
    for key in stat_keys:
        if key == "ppg":
            vals.append((row.get("fantasy_points_ppr") or 0) / g)
        elif key == "pass_ypg":
            vals.append((row.get("passing_yards") or 0) / g)
        elif key == "passing_tds_pg":
            vals.append((row.get("passing_tds") or 0) / g)
        elif key == "comp_pct":
            att = row.get("attempts") or 0
            comp = row.get("completions") or 0
            vals.append((comp / att * 100) if att > 0 else 0)
        elif key == "yards_per_att":
            att = row.get("attempts") or 0
            vals.append((row.get("passing_yards") or 0) / att if att > 0 else 0)
        elif key == "rushing_yards_pg":
            vals.append((row.get("rushing_yards") or 0) / g)
        elif key == "rushing_tds_pg":
            vals.append((row.get("rushing_tds") or 0) / g)
        elif key == "turnovers_pg":
            vals.append((row.get("turnovers") or 0) / g)
        elif key == "rush_ypg":
            vals.append((row.get("rushing_yards") or 0) / g)
        elif key == "yards_per_carry":
            car = row.get("carries") or 0
            vals.append((row.get("rushing_yards") or 0) / car if car > 0 else 0)
        elif key == "rec_ypg":
            vals.append((row.get("receiving_yards") or 0) / g)
        elif key == "receptions_pg":
            vals.append((row.get("receptions") or 0) / g)
        elif key == "yards_per_rec":
            rec = row.get("receptions") or 0
            vals.append((row.get("receiving_yards") or 0) / rec if rec > 0 else 0)
        elif key == "targets_pg":
            vals.append((row.get("targets") or 0) / g)
        elif key == "receiving_tds_pg":
            vals.append((row.get("receiving_tds") or 0) / g)
        elif key == "catch_rate":
            tgt = row.get("targets") or 0
            rec = row.get("receptions") or 0
            vals.append((rec / tgt * 100) if tgt > 0 else 0)
        elif key == "td_rate":
            car = row.get("carries") or 0
            tgt = row.get("targets") or 0
            tds = row.get("touchdowns") or 0
            opps = car + tgt
            vals.append((tds / opps * 100) if opps > 0 else 0)
        else:
            vals.append(0)
    return vals


def _cosine_similarity(a, b):
    """Cosine similarity between two vectors, returns 0-100 score."""
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    if mag_a == 0 or mag_b == 0:
        return 0
    return round(dot / (mag_a * mag_b) * 100, 1)


def fetch_player_boom_bust(player_id, season=0):
    """Analyze a player's weekly score distribution: boom/bust rates, consistency, percentiles."""
    conn = get_conn()

    # Get player info
    player = conn.execute(
        "SELECT player_id, full_name, position, team, age, headshot_url FROM players WHERE player_id = ?",
        (player_id,)
    ).fetchone()

    if not player:
        conn.close()
        return {"error": "Player not found"}

    player = dict(player)
    pos = (player.get("position") or "").upper()

    # Determine season
    if not season:
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        season = row[0] if row and row[0] else 2024

    # Get weekly fantasy scores for the player
    weeks = conn.execute("""
        SELECT week, fantasy_points_ppr
        FROM player_week_stats
        WHERE player_id = ? AND season = ?
        ORDER BY week
    """, (player_id, season)).fetchall()

    if len(weeks) < 4:
        conn.close()
        return {"error": "Not enough games (need 4+)", "player": player}

    weekly_scores = [{"week": w[0], "score": round(w[1] or 0, 2)} for w in weeks]
    scores = [w[1] or 0 for w in weeks]

    # Get position average PPG for boom/bust thresholds
    pos_avg_row = conn.execute("""
        SELECT AVG(ppg) FROM (
            SELECT SUM(s.fantasy_points_ppr) / COUNT(*) as ppg
            FROM player_week_stats s
            JOIN players p ON s.player_id = p.player_id
            WHERE p.position = ? AND s.season = ?
            GROUP BY s.player_id
            HAVING COUNT(*) >= 4
        )
    """, (pos, season)).fetchone()
    pos_avg_ppg = round(pos_avg_row[0], 2) if pos_avg_row and pos_avg_row[0] else 10.0

    # Position rank by consistency among same-position players
    all_pos_players = conn.execute("""
        SELECT s.player_id,
               AVG(s.fantasy_points_ppr) as avg_ppg,
               GROUP_CONCAT(s.fantasy_points_ppr) as scores_csv
        FROM player_week_stats s
        JOIN players p ON s.player_id = p.player_id
        WHERE p.position = ? AND s.season = ?
        GROUP BY s.player_id
        HAVING COUNT(*) >= 4
    """, (pos, season)).fetchall()

    conn.close()

    # Boom/bust thresholds: 1.5× and 0.5× position average
    boom_threshold = round(pos_avg_ppg * 1.5, 2)
    bust_threshold = round(pos_avg_ppg * 0.5, 2)

    # Calculate rates
    games = len(scores)
    boom_count = sum(1 for s in scores if s >= boom_threshold)
    bust_count = sum(1 for s in scores if s <= bust_threshold)
    boom_rate = round((boom_count / games) * 100, 1)
    bust_rate = round((bust_count / games) * 100, 1)

    # Stats
    scores_sorted = sorted(scores)
    mean_ppg = round(statistics.mean(scores), 2)
    median_ppg = round(statistics.median(scores), 2)
    stdev = round(statistics.stdev(scores), 2) if len(scores) > 1 else 0

    # Percentiles (floor=10th, ceiling=90th)
    def percentile(data, pct):
        idx = (pct / 100) * (len(data) - 1)
        lower = int(idx)
        upper = min(lower + 1, len(data) - 1)
        frac = idx - lower
        return round(data[lower] + frac * (data[upper] - data[lower]), 2)

    floor_ppg = percentile(scores_sorted, 10)
    ceiling_ppg = percentile(scores_sorted, 90)

    # Consistency score: inverse coefficient of variation, scaled 0-100
    # CV = stdev / mean. Lower CV = more consistent. Score = max(0, 100 - CV*100)
    if mean_ppg > 0:
        cv = stdev / mean_ppg
        consistency_score = round(max(0, min(100, 100 - cv * 100)), 1)
    else:
        consistency_score = 0

    # Grade based on consistency score
    grade_thresholds = [
        (90, "A+"), (85, "A"), (80, "A-"),
        (75, "B+"), (70, "B"), (65, "B-"),
        (60, "C+"), (55, "C"), (50, "C-"),
        (45, "D+"), (40, "D"), (35, "D-"),
        (0, "F"),
    ]
    grade = "F"
    for threshold, g in grade_thresholds:
        if consistency_score >= threshold:
            grade = g
            break

    # Position rank by consistency
    consistency_ranks = []
    for row in all_pos_players:
        pid = row[0]
        csv_str = row[2]
        if not csv_str:
            continue
        try:
            p_scores = [float(x) for x in csv_str.split(",")]
        except (ValueError, TypeError):
            continue
        if len(p_scores) < 2:
            continue
        p_mean = statistics.mean(p_scores)
        p_stdev = statistics.stdev(p_scores)
        p_cv = p_stdev / p_mean if p_mean > 0 else 999
        p_cons = max(0, min(100, 100 - p_cv * 100))
        consistency_ranks.append((pid, p_cons))

    consistency_ranks.sort(key=lambda x: -x[1])
    position_rank = 1
    total_ranked = len(consistency_ranks)
    for i, (pid, _) in enumerate(consistency_ranks):
        if pid == player_id:
            position_rank = i + 1
            break

    return {
        "player": {
            "player_id": player["player_id"],
            "full_name": player["full_name"],
            "position": pos,
            "team": player.get("team") or "FA",
            "age": player.get("age"),
            "headshot_url": player.get("headshot_url"),
        },
        "season": season,
        "games_played": games,
        "weekly_scores": weekly_scores,
        "mean_ppg": mean_ppg,
        "median_ppg": median_ppg,
        "floor_ppg": floor_ppg,
        "ceiling_ppg": ceiling_ppg,
        "stdev": stdev,
        "boom_rate": boom_rate,
        "bust_rate": bust_rate,
        "boom_threshold": boom_threshold,
        "bust_threshold": bust_threshold,
        "position_avg_ppg": pos_avg_ppg,
        "consistency_score": consistency_score,
        "grade": grade,
        "position_rank": position_rank,
        "position_total": total_ranked,
    }


def fetch_player_comps(player_id, limit=5, season=0):
    """Find the most statistically similar NFL players to a given player."""
    conn = get_conn()

    # Get target player info
    player = conn.execute(
        "SELECT player_id, full_name, position, team, age, headshot_url FROM players WHERE player_id = ?",
        (player_id,)
    ).fetchone()

    if not player:
        conn.close()
        return {"error": "Player not found", "comps": []}

    player = dict(player)
    pos = (player.get("position") or "").upper()
    if pos not in _COMP_STATS:
        conn.close()
        return {"error": f"Comps not available for position {pos}", "comps": []}

    stat_keys = _COMP_STATS[pos]

    # Determine season filter
    if not season:
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        season = row[0] if row and row[0] else 2024

    # Get target player's season stats
    target_row = conn.execute(f"""
        SELECT p.player_id, p.full_name, p.position, p.team, p.age, p.headshot_url,
               COUNT(*) as games,
               {_STAT_SUM_COLS}
        FROM player_week_stats s
        JOIN players p ON s.player_id = p.player_id
        WHERE s.player_id = ? AND s.season = ?
        GROUP BY s.player_id
        HAVING games >= 4
    """, (player_id, season)).fetchone()

    if not target_row:
        conn.close()
        return {"error": "Not enough games in season", "comps": [], "player": player}

    target = dict(target_row)
    target_vec = _build_stat_vector(target, stat_keys)

    # Get all same-position players (excluding target) with enough games
    all_rows = conn.execute(f"""
        SELECT p.player_id, p.full_name, p.position, p.team, p.age, p.headshot_url,
               COUNT(*) as games,
               {_STAT_SUM_COLS}
        FROM player_week_stats s
        JOIN players p ON s.player_id = p.player_id
        WHERE p.position = ? AND s.player_id != ? AND s.season = ?
        GROUP BY s.player_id
        HAVING games >= 4
    """, (pos, player_id, season)).fetchall()

    # Compute similarity for each candidate
    candidates = []
    for row in all_rows:
        r = dict(row)
        vec = _build_stat_vector(r, stat_keys)
        sim = _cosine_similarity(target_vec, vec)
        # Find top matching stats (smallest absolute difference when normalized)
        matching = []
        for i, key in enumerate(stat_keys):
            tv = target_vec[i]
            cv = vec[i]
            max_val = max(abs(tv), abs(cv), 0.001)
            diff_pct = abs(tv - cv) / max_val
            matching.append((key, diff_pct, tv, cv))
        matching.sort(key=lambda x: x[1])
        top_matches = [{"stat": m[0], "label": _COMP_STAT_LABELS.get(m[0], m[0]),
                        "target_val": round(m[2], 1), "comp_val": round(m[3], 1)}
                       for m in matching[:3]]

        # All stat values for comparison table + radar
        all_stats = {stat_keys[i]: round(vec[i], 1) for i in range(len(stat_keys))}

        candidates.append({
            "player_id": r["player_id"],
            "full_name": r["full_name"],
            "position": r["position"],
            "team": r["team"],
            "age": r.get("age"),
            "headshot_url": r.get("headshot_url"),
            "similarity": sim,
            "matching_stats": top_matches,
            "all_stats": all_stats,
            "games": r["games"],
            "ppg": round((r.get("fantasy_points_ppr") or 0) / (r["games"] or 1), 1),
        })

    # Sort by similarity descending
    candidates.sort(key=lambda x: x["similarity"], reverse=True)
    top = candidates[:limit]

    # Build target stat values for comparison
    target_stats = {}
    for key in stat_keys:
        idx = stat_keys.index(key)
        target_stats[key] = {
            "label": _COMP_STAT_LABELS.get(key, key),
            "value": round(target_vec[idx], 1)
        }

    conn.close()
    return {
        "player": {
            "player_id": target["player_id"],
            "full_name": target["full_name"],
            "position": target["position"],
            "team": target["team"],
            "age": target.get("age"),
            "headshot_url": target.get("headshot_url"),
            "games": target["games"],
            "ppg": round((target.get("fantasy_points_ppr") or 0) / (target["games"] or 1), 1),
        },
        "comps": top,
        "stat_keys": stat_keys,
        "stat_labels": {k: _COMP_STAT_LABELS.get(k, k) for k in stat_keys},
        "target_stats": target_stats,
        "season": season,
    }


# ---------------------------------------------------------------------------
# Team Roster
# ---------------------------------------------------------------------------

def fetch_team_roster(team=None, season=None):
    """Return all fantasy-relevant players for a team, grouped by position."""
    conn = get_conn()

    # Determine season
    if not season:
        row = conn.execute("SELECT MAX(season) FROM player_week_stats").fetchone()
        season = row[0] if row and row[0] else 2024

    # Get available seasons
    season_rows = conn.execute(
        "SELECT DISTINCT season FROM player_week_stats ORDER BY season DESC"
    ).fetchall()
    available_seasons = [r[0] for r in season_rows]

    # Get available teams for the selected season
    team_rows = conn.execute("""
        SELECT DISTINCT p.team FROM players p
        JOIN player_week_stats s ON s.player_id = p.player_id AND s.season = ?
        WHERE p.position IN ('QB','RB','WR','TE')
          AND p.team IS NOT NULL AND p.team != ''
        ORDER BY p.team
    """, [season]).fetchall()
    available_teams = [r[0] for r in team_rows]

    if not team or team.upper() not in available_teams:
        # Default to first available team alphabetically
        team = available_teams[0] if available_teams else "KC"

    team = team.upper()

    query = """
        SELECT
            p.player_id, p.full_name, p.position, p.team, p.age,
            p.headshot_url,
            SUM(s.fantasy_points_ppr) as total_ppr,
            COUNT(DISTINCT s.week) as games,
            SUM(s.passing_yards) as passing_yards,
            SUM(s.passing_tds) as passing_tds,
            SUM(s.rushing_yards) as rushing_yards,
            SUM(s.rushing_tds) as rushing_tds,
            SUM(s.receiving_yards) as receiving_yards,
            SUM(s.receiving_tds) as receiving_tds,
            SUM(s.receptions) as receptions,
            SUM(s.targets) as targets,
            SUM(s.carries) as carries
        FROM players p
        JOIN player_week_stats s
            ON s.player_id = p.player_id AND s.season = ?
        WHERE p.team = ?
          AND p.position IN ('QB','RB','WR','TE')
        GROUP BY p.player_id
        ORDER BY total_ppr DESC
    """
    rows = conn.execute(query, [season, team]).fetchall()
    conn.close()

    groups = {"QB": [], "RB": [], "WR": [], "TE": []}
    for r in rows:
        pid = r[0]
        pos = r[2] or "WR"
        games = r[7] or 0
        total_ppr = r[6] or 0
        ppg = round(total_ppr / games, 1) if games > 0 else 0.0

        player = {
            "player_id": pid,
            "full_name": r[1] or "Unknown",
            "position": pos,
            "team": r[3] or team,
            "age": r[4],
            "headshot_url": r[5] or "",
            "ppg": ppg,
            "games": games,
            "total_ppr": round(total_ppr, 1),
            "passing_yards": r[8] or 0,
            "passing_tds": r[9] or 0,
            "rushing_yards": r[10] or 0,
            "rushing_tds": r[11] or 0,
            "receiving_yards": r[12] or 0,
            "receiving_tds": r[13] or 0,
            "receptions": r[14] or 0,
            "targets": r[15] or 0,
            "carries": r[16] or 0,
        }

        if pos in groups:
            groups[pos].append(player)

    team_full = ABBREV_TO_TEAM.get(team, team)

    return {
        "team": team,
        "team_full_name": team_full,
        "season": season,
        "available_seasons": available_seasons,
        "available_teams": [{"abbr": t, "name": ABBREV_TO_TEAM.get(t, t)} for t in available_teams],
        "groups": groups,
        "total_players": sum(len(v) for v in groups.values()),
    }


# ---------------------------------------------------------------------------
# Positional Scarcity Dashboard
# ---------------------------------------------------------------------------

# Tier breaks: how many starters per position in a typical 12-team league
_SCARCITY_TIERS = {
    "QB": [
        {"label": "QB1", "start": 1, "end": 12},
        {"label": "QB2", "start": 13, "end": 24},
        {"label": "Streamer", "start": 25, "end": 36},
    ],
    "RB": [
        {"label": "RB1", "start": 1, "end": 12},
        {"label": "RB2", "start": 13, "end": 24},
        {"label": "Flex", "start": 25, "end": 36},
        {"label": "Bench", "start": 37, "end": 48},
    ],
    "WR": [
        {"label": "WR1", "start": 1, "end": 12},
        {"label": "WR2", "start": 13, "end": 24},
        {"label": "WR3", "start": 25, "end": 36},
        {"label": "Flex", "start": 37, "end": 48},
    ],
    "TE": [
        {"label": "TE1", "start": 1, "end": 12},
        {"label": "Streamer", "start": 13, "end": 24},
    ],
}

# Annotations for tier breaks (Caveat-style personality)
_SCARCITY_ANNOTATIONS = {
    "QB": {12: "the starter line", 24: "streaming territory"},
    "RB": {12: "league winners", 24: "the RB cliff", 36: "flex or bust"},
    "WR": {12: "alpha territory", 24: "WR2 floor", 36: "the depth drop"},
    "TE": {12: "the TE premium cliff", 24: "waiver wire"},
}


def fetch_positional_scarcity(season=None):
    """Return PPG drop-off data by position for scarcity analysis."""
    conn = get_conn()

    try:
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
    finally:
        conn.close()


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
    conn = get_conn()

    try:
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
    finally:
        conn.close()


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


def _efficiency_grade(pct):
    """Convert efficiency percentile (0-100) to letter grade."""
    if pct >= 95:
        return "A+"
    if pct >= 88:
        return "A"
    if pct >= 80:
        return "A-"
    if pct >= 72:
        return "B+"
    if pct >= 64:
        return "B"
    if pct >= 56:
        return "B-"
    if pct >= 48:
        return "C+"
    if pct >= 40:
        return "C"
    if pct >= 32:
        return "C-"
    if pct >= 24:
        return "D+"
    if pct >= 16:
        return "D"
    if pct >= 8:
        return "D-"
    return "F"


def fetch_buy_sell_candidates(season=None, position=None, limit=15):
    """Return players split into buy-low and sell-high based on efficiency vs dynasty rank."""
    conn = get_conn()

    try:
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
    finally:
        conn.close()


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
    conn = get_conn()

    try:
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
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Aging Curves — PPG by age per position
# ---------------------------------------------------------------------------

def fetch_aging_curves(season=None, position=None):
    """Return aging curve data: average PPG by age for each position,
    plus individual player data points for the selected season."""
    conn = get_conn()
    try:
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
    finally:
        conn.close()


def fetch_weekly_heatmap(season=None, position=None, limit=40):
    """Return weekly fantasy scores for top players in a grid format.

    Returns player rows with per-week PPG values and positional percentile
    thresholds for color coding.
    """
    conn = get_conn()
    try:
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
    finally:
        conn.close()


def fetch_target_distribution(season=None, team=None):
    """Return target and carry distribution by team.

    For each team, returns players sorted by targets (or carries for RB-heavy),
    with their share of team totals.
    """
    conn = get_conn()
    try:
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
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Matchup Heatmap — Fantasy Points Allowed by Defense per Position
# ---------------------------------------------------------------------------

def fetch_matchup_heatmap(season=None, position=None):
    """Return avg fantasy points allowed per game by each defense to each position.

    Computes from opponent_team in player_week_stats: group all player scores
    by opponent_team and position to find how many PPR points each defense allows.
    """
    conn = get_conn()
    try:
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
    finally:
        conn.close()


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
    conn = get_conn()

    try:
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
    finally:
        conn.close()


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
    conn = get_conn()

    try:
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
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Air Yards Dashboard
# ---------------------------------------------------------------------------

_AIR_BUY_LOW_ANNOTATIONS = ["due for more", "regression coming", "breakout loading", "undervalued", "TD drought ending"]
_AIR_SELL_HIGH_ANNOTATIONS = ["efficiency mirage", "TD luck", "volume mirage", "overperforming air yards", "regression risk"]


def fetch_air_yards(season=None, position=None, limit=25):
    """Air yards leaderboard with regression indicators (air yards rank vs PPG rank delta)."""
    conn = get_conn()

    try:
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
    finally:
        conn.close()


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
    conn = get_conn()

    try:
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
    finally:
        conn.close()


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
    conn = get_conn()

    try:
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
    finally:
        conn.close()


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

    conn = get_conn()

    try:
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
    finally:
        conn.close()


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
    conn = get_conn()
    try:
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
    finally:
        conn.close()


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

    conn = get_conn()
    try:
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
    finally:
        conn.close()


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

    conn = get_conn()
    try:
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

        # Build team totals
        team_totals = defaultdict(lambda: {
            "targets": 0, "carries": 0,
            "rec_yards": 0, "rec_tds": 0,
            "rush_yards": 0, "rush_tds": 0,
        })

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

            t = team_totals[team]
            t["targets"] += targets
            t["carries"] += carries
            t["rec_yards"] += rec_yards
            t["rec_tds"] += rec_tds
            t["rush_yards"] += rush_yards
            t["rush_tds"] += rush_tds

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
    finally:
        conn.close()


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

    conn = get_conn()
    try:
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

        # Aggregate per player
        player_info = {}
        player_weeks = defaultdict(list)
        player_opps = defaultdict(lambda: {
            "targets": 0, "carries": 0, "total_pts": 0, "games": 0,
            "rec_yards": 0, "rec_tds": 0, "rush_yards": 0,
        })
        player_sos = defaultdict(list)
        # Track team totals for opp share
        team_totals = defaultdict(lambda: {"targets": 0, "carries": 0, "rec_yards": 0, "rec_tds": 0, "rush_yards": 0})

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

            team = r[3] or "FA"
            t = team_totals[team]
            t["targets"] += targets
            t["carries"] += carries
            t["rec_yards"] += rec_yards
            t["rec_tds"] += rec_tds
            t["rush_yards"] += rush_yards

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
    finally:
        conn.close()