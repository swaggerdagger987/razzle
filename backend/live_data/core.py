"""
core.py — Shared helpers, constants, and enrichment functions.

Used by all other live_data submodules. No DB imports here;
enrichment functions that need a connection receive it as a parameter.
"""

import logging
import math
import threading
import time as _time
from datetime import datetime as _datetime

logger = logging.getLogger("razzle.live_data.core")


def _current_nfl_season():
    """Return the current NFL season year (rolls over in August)."""
    now = _datetime.now()
    return now.year if now.month >= 8 else now.year - 1


def _current_draft_year():
    """Return the current draft year (same as calendar year)."""
    return _datetime.now().year

# ---------------------------------------------------------------------------
# In-memory cache
# ---------------------------------------------------------------------------

_cache = {}
_CACHE_TTL = 300  # 5 minutes default
_CACHE_TTL_STABLE = 3600  # 60 minutes for stable/historical data
_CACHE_MAX_SIZE = 200  # LRU eviction threshold
_cache_locks = {}  # per-key locks for stampede protection
_cache_meta_lock = threading.Lock()  # protects _cache_locks dict


def _cached(key, fn, ttl=None):
    """Return cached result or compute and cache. Stampede-protected, LRU eviction."""
    if ttl is None:
        ttl = _CACHE_TTL
    now = _time.time()
    # Fast path: cache hit (no lock needed, dict reads are thread-safe in CPython)
    if key in _cache and now - _cache[key]["t"] < ttl:
        _cache[key]["a"] = now  # touch for LRU
        return _cache[key]["v"]
    # Slow path: get per-key lock to prevent stampede (only one thread computes)
    with _cache_meta_lock:
        if key not in _cache_locks:
            _cache_locks[key] = threading.Lock()
        key_lock = _cache_locks[key]
    with key_lock:
        # Double-check: another thread may have filled the cache while we waited
        now = _time.time()
        if key in _cache and now - _cache[key]["t"] < ttl:
            _cache[key]["a"] = now
            return _cache[key]["v"]
        # Evict stale entries first, then LRU if still over limit
        if len(_cache) >= _CACHE_MAX_SIZE:
            _cache_evict(now)
        result = fn()
        _cache[key] = {"t": now, "v": result, "a": now, "ttl": ttl}
        return result


def _cache_evict(now):
    """Evict expired entries, then least-recently-accessed if still over limit."""
    # Phase 1: remove expired entries
    expired = [k for k, v in _cache.items() if now - v["t"] >= v.get("ttl", _CACHE_TTL_STABLE)]
    for k in expired:
        del _cache[k]
    # Phase 2: if still over limit, remove least-recently-accessed
    if len(_cache) >= _CACHE_MAX_SIZE:
        by_access = sorted(_cache.items(), key=lambda x: x[1].get("a", 0))
        remove_count = len(_cache) - _CACHE_MAX_SIZE + 20  # free 20 extra slots
        for k, _ in by_access[:remove_count]:
            del _cache[k]


def cache_stats():
    """Return cache diagnostics for health check."""
    now = _time.time()
    total = len(_cache)
    active = sum(1 for v in _cache.values() if now - v["t"] < v.get("ttl", _CACHE_TTL))
    return {"total_entries": total, "active_entries": active, "max_size": _CACHE_MAX_SIZE}


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

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

# NFL team name -> abbreviation (for combine data that stores full names)
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

# Reverse mapping: abbreviation -> full team name (current names only)
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


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_div(a, b, decimals=1):
    """Safe division, returns None if denominator is 0/None."""
    if not b:
        return None
    return round(a / b, decimals)


# ---------------------------------------------------------------------------
# Enrichment functions (pure transforms or conn-based lookups)
# ---------------------------------------------------------------------------

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
        # Half-PPR per game (fallback: compute from PPR - 0.5*rec if column is NULL)
        hppr = item.get("fantasy_points_half_ppr")
        if not hppr and item.get("fantasy_points_ppr"):
            hppr = (item.get("fantasy_points_ppr") or 0) - 0.5 * (item.get("receptions") or 0)
        item["half_ppr_ppg"] = _safe_div(hppr or 0, g)
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

    DVS = production_score x age_multiplier
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
            SELECT player_id,
                pass_success_rate, rush_success_rate, total_ryoe, ryoe_per_carry,
                avg_score_differential, play_action_attempts, play_action_completions,
                play_action_yards, play_action_tds, scramble_attempts, scramble_yards,
                scramble_tds, garbage_time_pct, gl_carries, gl_targets, gl_tds,
                two_point_conversions, return_yards, return_tds,
                intended_air_yards, intended_air_yards_per_target, drops, drop_rate,
                bye_week, games_missed
            FROM player_season_pbp
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
            s = row[0] if row and row[0] else _current_nfl_season()
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


# ---------------------------------------------------------------------------
# Nickname map and name matching (used by prospect/college enrichment)
# ---------------------------------------------------------------------------

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
        # Nickname -> full name
        if first in _NICKNAME_MAP:
            variants.add(_NICKNAME_MAP[first] + rest)
        # Full name -> nickname (reverse lookup)
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


# ---------------------------------------------------------------------------
# Trade Value Model
# ---------------------------------------------------------------------------
# Trade value = composite of:
#   1. PPR points per game (production) -- 50% weight
#   2. Age depreciation curve (youth premium) -- 30% weight
#   3. Positional scarcity (replacement-level gap) -- 20% weight
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


# ---------------------------------------------------------------------------
# Draft Pick Trade Values
# ---------------------------------------------------------------------------

def _pick_value(overall_pick):
    """Dynasty draft pick value on 0-100 scale using exponential decay.

    1.01 (overall 1) ~ 88, mid-1st ~ 70, late-1st ~ 55,
    early-2nd ~ 42, mid-3rd ~ 15, late-4th ~ 3.
    """
    # Exponential decay: V = A * e^(-k * (pick-1))
    # Calibrated so pick 1 = 88, pick 12 = 55, pick 48 = 3
    A = 88.0
    k = 0.070
    val = A * math.exp(-k * (overall_pick - 1))
    return round(max(1.0, val), 1)


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


# ---------------------------------------------------------------------------
# Trade Value Chart tiers
# ---------------------------------------------------------------------------

_TV_TIER_LABELS = {
    1: "Elite",
    2: "Blue Chip",
    3: "Premium",
    4: "Solid",
    5: "Promising",
    6: "Depth",
    7: "Roster Clogger",
    8: "Cut Bait",
}


def _tv_tier(value):
    """Assign trade-value tier 1-8."""
    if value >= 90:
        return 1
    if value >= 78:
        return 2
    if value >= 66:
        return 3
    if value >= 54:
        return 4
    if value >= 42:
        return 5
    if value >= 30:
        return 6
    if value >= 18:
        return 7
    return 8


# ---------------------------------------------------------------------------
# Efficiency grading
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Player Comp Finder -- cosine similarity on production profiles
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
