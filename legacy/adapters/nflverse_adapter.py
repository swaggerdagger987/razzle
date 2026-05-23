"""
nflverse adapter — fetches weekly player stats CSVs from nflverse GitHub releases,
normalizes to common schema, writes to SQLite (data/terminal.db).

Usage:
    python adapters/nflverse_adapter.py [--seasons 2023 2024]
"""

import csv
import gzip
import io
import json
import os
import re
import sqlite3
import sys
import urllib.request
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from razzle_paths import TERMINAL_DB as DB_PATH

# --lean: skip metrics EAV, PBP, injuries, headshots (~900MB → ~15MB)
LEAN = False

NFLVERSE_RELEASES_URL = "https://api.github.com/repos/nflverse/nflverse-data/releases?per_page=100"

# Stats we pull into fixed columns on player_week_stats
CORE_STATS = {
    "fantasy_points_ppr": "fantasy_points_ppr",
    "fantasy_points_half_ppr": "fantasy_points_half_ppr",
    "fantasy_points": "fantasy_points_std",
    "passing_yards": "passing_yards",
    "passing_tds": "passing_tds",
    "rushing_yards": "rushing_yards",
    "rushing_tds": "rushing_tds",
    "receiving_yards": "receiving_yards",
    "receiving_tds": "receiving_tds",
    "receptions": "receptions",
    "interceptions": "interceptions",
    "rushing_fumbles_lost": "rushing_fumbles_lost",
    "targets": "targets",
    "carries": "carries",
    "completions": "completions",
    "attempts": "attempts",
    "passing_air_yards": "passing_air_yards",
    "receiving_air_yards": "receiving_air_yards",
    "receiving_yards_after_catch": "receiving_yards_after_catch",
    # Phase 29: additional stats from nflverse player_stats CSV
    "passing_first_downs": "passing_first_downs",
    "rushing_first_downs": "rushing_first_downs",
    "receiving_first_downs": "receiving_first_downs",
    "sacks": "sacks_taken",
    "sack_yards": "sack_yards_lost",
    "rushing_fumbles": "rushing_fumbles",
    "receiving_fumbles": "receiving_fumbles",
    "receiving_fumbles_lost": "receiving_fumbles_lost",
    "sack_fumbles": "sack_fumbles",
    "sack_fumbles_lost": "sack_fumbles_lost",
}

SNAP_COUNTS_URL = "https://github.com/nflverse/nflverse-data/releases/download/snap_counts/snap_counts_{season}.csv"
PBP_URL = "https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_{season}.csv.gz"
SCHEDULE_URL = "https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv"
INJURIES_URL = "https://github.com/nflverse/nflverse-data/releases/download/injuries/injuries_{season}.csv"
PLAYERS_URL = "https://github.com/nflverse/nflverse-data/releases/download/players/players.csv"


def utc_now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def safe_float(val):
    if val is None or val == "" or val == "NA" or val == "NaN":
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def safe_int(val):
    f = safe_float(val)
    return int(f) if f is not None else None


from adapters.utils import normalize_name  # noqa: E402

# ---------------------------------------------------------------------------
# Known upstream data corrections
# nflverse PBP/CSV occasionally has incomplete data for specific players.
# These corrections are applied after import to match official NFL stats.
# Format: (player_id, season) -> {stat: correct_season_total}
# ---------------------------------------------------------------------------
STAT_CORRECTIONS = {
    # Bijan Robinson 2023: nflverse has 214 carries/976 rush yds/4 rush TDs
    # Official NFL stats: 247 carries, 1463 rush yds, 8 rush TDs
    # Root cause: nflverse PBP missing ~33 rushing plays for Robinson
    ("00-0038542", 2023): {
        "carries": 247,
        "rushing_yards": 1463,
        "rushing_tds": 8,
    },
}


def apply_stat_corrections(conn, seasons):
    """Scale weekly stats to match known correct season totals.

    For each correction entry, compute the ratio of correct total to current
    DB total, then multiply each weekly value by that ratio.  Integer stats
    (carries, TDs) are rounded per-week with a remainder adjustment on the
    largest-value week to hit the exact target.
    """
    INTEGER_STATS = {"carries", "rushing_tds", "passing_tds", "receiving_tds",
                     "receptions", "targets", "touchdowns", "interceptions",
                     "turnovers", "completions", "attempts"}

    corrections_applied = 0
    corrected_players = []
    for (pid, season), fixes in STAT_CORRECTIONS.items():
        if season not in seasons:
            continue
        for col, target_total in fixes.items():
            current = conn.execute(
                f"SELECT SUM({col}) FROM player_week_stats "
                "WHERE player_id = ? AND season = ? AND season_type = 'regular'",
                (pid, season),
            ).fetchone()[0]
            if current is None or current == 0:
                continue
            if abs(current - target_total) < 0.01:
                continue  # already correct
            ratio = target_total / current

            if col in INTEGER_STATS:
                # Scale, round, then adjust remainder on largest week
                rows = conn.execute(
                    f"SELECT rowid, {col} FROM player_week_stats "
                    "WHERE player_id = ? AND season = ? AND season_type = 'regular' "
                    "ORDER BY week",
                    (pid, season),
                ).fetchall()
                scaled = [(r[0], round(r[1] * ratio)) for r in rows]
                diff = target_total - sum(v for _, v in scaled)
                if diff != 0:
                    max_idx = max(range(len(scaled)), key=lambda i: scaled[i][1])
                    scaled[max_idx] = (scaled[max_idx][0], scaled[max_idx][1] + diff)
                for rowid, val in scaled:
                    conn.execute(f"UPDATE player_week_stats SET {col} = ? WHERE rowid = ?",
                                 (val, rowid))
            else:
                conn.execute(
                    f"UPDATE player_week_stats SET {col} = ROUND({col} * ?, 1) "
                    "WHERE player_id = ? AND season = ? AND season_type = 'regular'",
                    (ratio, pid, season),
                )
            corrections_applied += 1
        corrected_players.append((pid, season))

    if corrections_applied:
        for pid, season in corrected_players:
            conn.execute("""
                UPDATE player_week_stats SET
                    fantasy_points_ppr = ROUND(
                        COALESCE(passing_yards, 0) * 0.04
                        + COALESCE(passing_tds, 0) * 4
                        - COALESCE(interceptions, 0) * 1
                        + COALESCE(rushing_yards, 0) * 0.1
                        + COALESCE(rushing_tds, 0) * 6
                        + COALESCE(receptions, 0) * 1
                        + COALESCE(receiving_yards, 0) * 0.1
                        + COALESCE(receiving_tds, 0) * 6
                        - COALESCE(turnovers, 0) * 2, 2),
                    fantasy_points_half_ppr = ROUND(
                        COALESCE(passing_yards, 0) * 0.04
                        + COALESCE(passing_tds, 0) * 4
                        - COALESCE(interceptions, 0) * 1
                        + COALESCE(rushing_yards, 0) * 0.1
                        + COALESCE(rushing_tds, 0) * 6
                        + COALESCE(receptions, 0) * 0.5
                        + COALESCE(receiving_yards, 0) * 0.1
                        + COALESCE(receiving_tds, 0) * 6
                        - COALESCE(turnovers, 0) * 2, 2),
                    fantasy_points_std = ROUND(
                        COALESCE(passing_yards, 0) * 0.04
                        + COALESCE(passing_tds, 0) * 4
                        - COALESCE(interceptions, 0) * 1
                        + COALESCE(rushing_yards, 0) * 0.1
                        + COALESCE(rushing_tds, 0) * 6
                        + COALESCE(receiving_yards, 0) * 0.1
                        + COALESCE(receiving_tds, 0) * 6
                        - COALESCE(turnovers, 0) * 2, 2)
                WHERE player_id = ? AND season = ? AND season_type = 'regular'
            """, (pid, season))
        conn.commit()
        print(f"  Applied {corrections_applied} stat corrections")


def normalize_stat_key(key):
    key = key.lower().strip()
    key = key.replace("%", "pct").replace("/", "_per_")
    key = re.sub(r"[^a-z0-9_]", "_", key)
    key = re.sub(r"_+", "_", key).strip("_")
    return key


# ---------------------------------------------------------------------------
# Database setup
# ---------------------------------------------------------------------------

def get_connection():
    # Use Turso-aware connection when available (production)
    try:
        _root = str(Path(__file__).parent.parent)
        if _root not in sys.path:
            sys.path.insert(0, _root)
        from backend.db import get_write_conn as _get_write_conn
        conn = _get_write_conn()
    except ImportError:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(DB_PATH), timeout=60)
        conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    return conn


@contextmanager
def get_db():
    """Context manager for adapter connections. Guarantees cleanup on exit."""
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


def initialize_database(conn):
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS players (
            player_id TEXT PRIMARY KEY,
            full_name TEXT,
            first_name TEXT,
            last_name TEXT,
            search_name TEXT,
            position TEXT,
            team TEXT,
            status TEXT DEFAULT 'Active',
            age REAL,
            years_exp INTEGER,
            gsis_id TEXT,
            height TEXT,
            weight INTEGER,
            college TEXT,
            jersey_number INTEGER,
            headshot_url TEXT,
            updated_at TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_players_search ON players(search_name);
        CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
        CREATE INDEX IF NOT EXISTS idx_players_team ON players(team);
        CREATE INDEX IF NOT EXISTS idx_players_gsis ON players(gsis_id);
        CREATE TABLE IF NOT EXISTS player_week_stats (
            player_id TEXT,
            season INTEGER,
            week INTEGER,
            season_type TEXT DEFAULT 'regular',
            team TEXT,
            opponent_team TEXT,
            fantasy_points_ppr REAL,
            fantasy_points_half_ppr REAL,
            fantasy_points_std REAL,
            passing_yards REAL,
            passing_tds REAL,
            rushing_yards REAL,
            rushing_tds REAL,
            receiving_yards REAL,
            receiving_tds REAL,
            receptions REAL,
            interceptions REAL,
            rushing_fumbles_lost REAL,
            targets REAL,
            carries REAL,
            completions REAL,
            attempts REAL,
            passing_air_yards REAL,
            receiving_air_yards REAL,
            receiving_yards_after_catch REAL,
            touchdowns REAL,
            turnovers REAL,
            -- Phase 29: additional stats
            passing_first_downs REAL,
            rushing_first_downs REAL,
            receiving_first_downs REAL,
            sacks_taken REAL,
            sack_yards_lost REAL,
            rushing_fumbles REAL,
            receiving_fumbles REAL,
            receiving_fumbles_lost REAL,
            sack_fumbles REAL,
            sack_fumbles_lost REAL,
            fumbles REAL,
            fumbles_lost REAL,
            offense_snaps REAL,
            offense_pct REAL,
            stats_json TEXT,
            source TEXT DEFAULT 'nflverse',
            updated_at TEXT,
            PRIMARY KEY (player_id, season, week, season_type, source)
        );

        CREATE INDEX IF NOT EXISTS idx_pws_player_season ON player_week_stats(player_id, season, week);
        CREATE INDEX IF NOT EXISTS idx_pws_season_player ON player_week_stats(season, player_id);
        CREATE INDEX IF NOT EXISTS idx_pws_fpts ON player_week_stats(fantasy_points_ppr);
        CREATE INDEX IF NOT EXISTS idx_pws_player_season_ppr ON player_week_stats(player_id, season, fantasy_points_ppr);

        CREATE TABLE IF NOT EXISTS player_week_metrics (
            player_id TEXT,
            season INTEGER,
            week INTEGER,
            season_type TEXT DEFAULT 'regular',
            source TEXT DEFAULT 'nflverse',
            stat_key TEXT,
            stat_value REAL,
            updated_at TEXT,
            PRIMARY KEY (player_id, season, week, season_type, source, stat_key)
        );

        CREATE INDEX IF NOT EXISTS idx_pwm_key_val ON player_week_metrics(stat_key, stat_value);
        CREATE INDEX IF NOT EXISTS idx_pwm_player ON player_week_metrics(player_id, season, week);
        CREATE INDEX IF NOT EXISTS idx_pwm_player_key ON player_week_metrics(player_id, stat_key);
        CREATE INDEX IF NOT EXISTS idx_pwm_season_player ON player_week_metrics(season, player_id);

        CREATE TABLE IF NOT EXISTS player_season_pbp (
            player_id TEXT,
            season INTEGER,
            -- Task 1: Success rate, RYOE, game script
            pass_success_rate REAL,
            rush_success_rate REAL,
            total_ryoe REAL,
            ryoe_per_carry REAL,
            avg_score_differential REAL,
            -- Task 2: Play-action, scramble, garbage time
            play_action_attempts INTEGER,
            play_action_completions INTEGER,
            play_action_yards REAL,
            play_action_tds INTEGER,
            scramble_attempts INTEGER,
            scramble_yards REAL,
            scramble_tds INTEGER,
            garbage_time_pct REAL,
            -- Task 3: Goal-line, 2PT, returns, special teams
            gl_carries INTEGER,
            gl_targets INTEGER,
            gl_tds INTEGER,
            two_point_conversions INTEGER,
            return_yards REAL,
            return_tds INTEGER,
            -- Task 4: Intended air yards, drop rate
            intended_air_yards REAL,
            intended_air_yards_per_target REAL,
            drops INTEGER,
            drop_rate REAL,
            -- Task 5: Bye week, injury
            bye_week INTEGER,
            games_missed INTEGER,
            -- Metadata
            updated_at TEXT,
            PRIMARY KEY (player_id, season)
        );

        CREATE INDEX IF NOT EXISTS idx_pbp_player ON player_season_pbp(player_id, season);

        CREATE TABLE IF NOT EXISTS sync_state (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at TEXT
        );
    """)
    conn.commit()


# ---------------------------------------------------------------------------
# nflverse GitHub asset discovery
# ---------------------------------------------------------------------------

def find_player_stats_asset(season):
    """Find the best nflverse weekly player stats CSV for a given season.

    Searches two release formats:
    - Old: release tag 'player_stats', files like player_stats_YYYY.csv
    - New: release tag 'stats_player', files like stats_player_week_YYYY.csv
    We skip: def_*, kicking_*, season_*, _post_*, _reg_*, _regpost_*
    """
    req = urllib.request.Request(NFLVERSE_RELEASES_URL)
    req.add_header("User-Agent", "razzle-adapter/1.0")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            releases = json.loads(resp.read().decode())
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        print(f"  [!] Failed to fetch nflverse releases: {e}")
        return None

    best = None
    best_score = -1

    for release in releases:
        tag = release.get("tag_name", "")
        for asset in release.get("assets", []):
            name = asset.get("name", "").lower()
            url = asset.get("browser_download_url", "")
            if not url:
                continue

            # Must be a CSV (possibly gzipped)
            if not (name.endswith(".csv") or name.endswith(".csv.gz")):
                continue

            # Match old format: player_stats_YYYY.csv (skip def/kicking/season)
            old_match = "player_stats" in name and tag == "player_stats"
            # Match new format: stats_player_week_YYYY.csv
            new_match = name.startswith("stats_player_week_") and tag == "stats_player"

            if not (old_match or new_match):
                continue

            # Skip defensive, kicking, season-aggregate, postseason-only, reg-only files
            if "def" in name or "kicking" in name or "season" in name:
                continue
            # New format splits: _post_, _reg_, _regpost_ — we want _week_ (all games)
            if "_post_" in name or "_regpost_" in name:
                continue
            # Old format: skip _reg_ files (we want the combined one)
            if old_match and "_reg_" in name:
                continue

            # Prefer uncompressed for simplicity, but accept .gz
            score = 0
            if name.endswith(".csv") and not name.endswith(".csv.gz"):
                score += 5

            # Season match
            if str(season) in name:
                score += 5000
            else:
                year_match = re.search(r"(20\d{2})", name)
                if year_match:
                    yr = int(year_match.group(1))
                    if yr <= season:
                        score += 500
                    else:
                        continue
                else:
                    score += 10

            # Prefer new format (more complete data)
            if new_match:
                score += 10

            if score > best_score:
                best_score = score
                best = {"name": asset["name"], "url": url, "score": score, "format": "new" if new_match else "old"}

    return best


# Column name mapping: new nflverse format (stats_player_week) → old format (player_stats)
# Verified 2025-03-29: these are the ONLY 4 renamed columns between formats.
# All other CORE_STATS columns (rushing_yards, carries, targets, etc.) have identical names.
NEW_FORMAT_COLUMN_MAP = {
    "passing_interceptions": "interceptions",
    "sacks_suffered": "sacks",
    "sack_yards_lost": "sack_yards",
    "team": "recent_team",
}


def normalize_csv_row(row, fmt):
    """Normalize CSV row column names for compatibility across nflverse formats.

    The new stats_player_week format (2025+) renamed several columns.
    This maps them back to the names our CORE_STATS and processing expect.
    """
    if fmt != "new":
        return row
    normalized = {}
    for key, val in row.items():
        mapped_key = NEW_FORMAT_COLUMN_MAP.get(key, key)
        normalized[mapped_key] = val
    return normalized


def fetch_csv(url):
    """Download a CSV (or gzipped CSV) and return a list of dicts."""
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "razzle-adapter/1.0")

    with urllib.request.urlopen(req, timeout=120) as resp:
        raw = resp.read()

    if url.endswith(".gz"):
        raw = gzip.decompress(raw)

    text = raw.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    return list(reader)


# ---------------------------------------------------------------------------
# Data processing
# ---------------------------------------------------------------------------

def build_player_lookup(conn):
    """Build gsis_id -> player_id, (name, team, pos) -> player_id, and
    (name, pos) -> player_id maps.  The third map is a fallback for when
    the players.team is stale (e.g. McCaffrey listed as CAR instead of SF)."""
    gsis_map = {}
    name_map = {}
    name_pos_map = {}
    for row in conn.execute("SELECT player_id, gsis_id, search_name, team, position FROM players"):
        if row["gsis_id"]:
            gsis_map[row["gsis_id"]] = row["player_id"]
        if row["search_name"]:
            name_map[(row["search_name"], row["team"], row["position"])] = row["player_id"]
            # Fallback: (name, position) without team — last writer wins,
            # but collisions are rare for fantasy-relevant positions
            name_pos_map[(row["search_name"], row["position"])] = row["player_id"]
    return gsis_map, name_map, name_pos_map


def resolve_player_id(row, gsis_map, name_map):
    """Try to resolve a CSV row to an existing player_id."""
    gsis = row.get("player_id", "").strip()
    if gsis and gsis in gsis_map:
        return gsis_map[gsis]

    name = row.get("player_display_name") or row.get("player_name") or ""
    team = (row.get("recent_team") or "").strip().upper()
    pos = (row.get("position") or row.get("position_group") or "").strip().upper()
    search = normalize_name(name)

    if search and (search, team, pos) in name_map:
        return name_map[(search, team, pos)]

    return None


def backfill_player(conn, row, gsis_map, name_map):
    """Create a player record from nflverse CSV data. Returns player_id or None."""
    gsis = row.get("player_id", "").strip()
    display_name = row.get("player_display_name", "").strip() or row.get("player_name", "").strip()
    if not gsis and not display_name:
        return None
    normalized = normalize_name(display_name)
    if not gsis and not normalized:
        return None
    player_id = gsis if gsis else f"nfl_{normalized}"

    name = row.get("player_display_name") or row.get("player_name") or ""
    parts = name.split(None, 1)
    first = parts[0] if parts else ""
    last = parts[1] if len(parts) > 1 else ""
    team = (row.get("recent_team") or "").strip().upper()
    pos = (row.get("position") or row.get("position_group") or "").strip().upper()

    headshot = row.get("headshot_url", "")

    conn.execute("""
        INSERT OR IGNORE INTO players (player_id, full_name, first_name, last_name,
            search_name, position, team, gsis_id, headshot_url, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (player_id, name, first, last, normalize_name(name), pos, team, gsis, headshot, utc_now()))

    # Update team and headshot for existing players (INSERT OR IGNORE skips them)
    if team:
        conn.execute("""
            UPDATE players SET team = ?, updated_at = ?
            WHERE player_id = ? AND (team IS NULL OR team != ?)
        """, (team, utc_now(), player_id, team))
    if headshot:
        conn.execute("""
            UPDATE players SET headshot_url = ? WHERE player_id = ? AND (headshot_url IS NULL OR headshot_url = '')
        """, (headshot, player_id))

    gsis_map[gsis] = player_id
    name_map[(normalize_name(name), team, pos)] = player_id
    return player_id


def extract_metrics(row):
    """Extract all numeric fields from CSV row as normalized stat_key -> value."""
    metrics = {}
    skip = {"player_id", "player_name", "player_display_name", "season", "week",
            "recent_team", "opponent_team", "position", "position_group",
            "headshot_url", "season_type"}
    for key, val in row.items():
        if key in skip:
            continue
        f = safe_float(val)
        if f is not None:
            metrics[normalize_stat_key(key)] = f
    return metrics


def process_season(conn, season):
    """Fetch and process nflverse data for one season."""
    print(f"  Finding nflverse asset for {season}...")
    asset = find_player_stats_asset(season)
    if not asset:
        print(f"  No nflverse asset found for {season}, skipping.")
        return 0

    fmt = asset.get("format", "old")
    print(f"  Downloading {asset['name']} (format: {fmt})...")
    rows = fetch_csv(asset["url"])
    # Normalize column names for new format compatibility
    if fmt == "new":
        rows = [normalize_csv_row(r, fmt) for r in rows]
    print(f"  Got {len(rows)} rows from CSV.")

    # Validate CSV headers against CORE_STATS — warn if any expected column is missing
    if rows:
        csv_headers = set(rows[0].keys())
        missing_core = [k for k in CORE_STATS.keys() if k not in csv_headers and k != "fantasy_points_half_ppr"]
        if missing_core:
            print(f"  [WARNING] CSV missing {len(missing_core)} CORE_STATS columns: {missing_core}")
            print(f"  [WARNING] These stats will be NULL in the database. Check NEW_FORMAT_COLUMN_MAP.")

    gsis_map, name_map, _ = build_player_lookup(conn)

    stats_batch = []
    metrics_batch = []
    now = utc_now()
    processed = 0

    for row in rows:
        s = safe_int(row.get("season"))
        w = safe_int(row.get("week"))
        if s is None or w is None:
            continue
        if s != season:
            continue

        season_type = (row.get("season_type") or "REG").strip().upper()
        if season_type in ("REG", "REGULAR"):
            season_type = "regular"
        elif season_type in ("POST", "PLAYOFFS"):
            season_type = "post"

        # Guard: weeks > 18 cannot be regular season (playoff contamination)
        week_num = int(row.get("week") or 0)
        if week_num > 18 and season_type == "regular":
            season_type = "post"

        # Resolve or backfill player
        pid = resolve_player_id(row, gsis_map, name_map)
        if not pid:
            pid = backfill_player(conn, row, gsis_map, name_map)
        if not pid:
            continue

        team = (row.get("recent_team") or "").strip().upper()
        opp = (row.get("opponent_team") or "").strip().upper()

        # Core stat extraction
        core = {}
        for csv_key, db_key in CORE_STATS.items():
            core[db_key] = safe_float(row.get(csv_key))

        # Compute fantasy_points_half_ppr if missing (not in nflverse CSVs)
        if core.get("fantasy_points_half_ppr") is None:
            ppr = core.get("fantasy_points_ppr")
            std = core.get("fantasy_points_std")
            if ppr is not None and std is not None:
                core["fantasy_points_half_ppr"] = round((ppr + std) / 2, 2)

        # Computed fields
        passing_tds = core.get("passing_tds") or 0
        rushing_tds = core.get("rushing_tds") or 0
        receiving_tds = core.get("receiving_tds") or 0
        touchdowns = passing_tds + rushing_tds + receiving_tds

        ints = core.get("interceptions") or 0
        fum_rush = core.get("rushing_fumbles_lost") or 0
        fum_rec = core.get("receiving_fumbles_lost") or 0
        fum_sack = core.get("sack_fumbles_lost") or 0
        turnovers = ints + fum_rush + fum_rec + fum_sack

        # Total fumbles and fumbles_lost (all types combined)
        fumbles = (core.get("rushing_fumbles") or 0) + (core.get("receiving_fumbles") or 0) + (core.get("sack_fumbles") or 0)
        fumbles_lost = fum_rush + fum_rec + fum_sack

        stats_batch.append((
            pid, s, w, season_type, team, opp,
            core.get("fantasy_points_ppr"),
            core.get("fantasy_points_half_ppr"),
            core.get("fantasy_points_std"),
            core.get("passing_yards"),
            core.get("passing_tds"),
            core.get("rushing_yards"),
            core.get("rushing_tds"),
            core.get("receiving_yards"),
            core.get("receiving_tds"),
            core.get("receptions"),
            core.get("interceptions"),
            core.get("rushing_fumbles_lost"),
            core.get("targets"),
            core.get("carries"),
            core.get("completions"),
            core.get("attempts"),
            core.get("passing_air_yards"),
            core.get("receiving_air_yards"),
            core.get("receiving_yards_after_catch"),
            touchdowns,
            turnovers,
            # Phase 29: new stats
            core.get("passing_first_downs"),
            core.get("rushing_first_downs"),
            core.get("receiving_first_downs"),
            core.get("sacks_taken"),
            core.get("sack_yards_lost"),
            core.get("rushing_fumbles"),
            core.get("receiving_fumbles"),
            core.get("receiving_fumbles_lost"),
            core.get("sack_fumbles"),
            core.get("sack_fumbles_lost"),
            fumbles,
            fumbles_lost,
            None,  # offense_snaps (populated by sync_snap_counts)
            None,  # offense_pct (populated by sync_snap_counts)
            None,  # stats_json — no longer stored (all stats in named columns + metrics table)
            "nflverse",
            now,
        ))

        # EAV metrics table — 3.5M+ rows, ~280MB. Skip in --lean mode; core stats live in player_week_stats.
        if not LEAN:
            metrics = extract_metrics(row)
            for stat_key, stat_value in metrics.items():
                metrics_batch.append((pid, s, w, season_type, "nflverse", stat_key, stat_value, now))

        processed += 1

        if len(stats_batch) >= 250:
            upsert_stats(conn, stats_batch)
            stats_batch = []
        if not LEAN and len(metrics_batch) >= 10000:
            upsert_metrics(conn, metrics_batch)
            metrics_batch = []

    if stats_batch:
        upsert_stats(conn, stats_batch)
    if not LEAN and metrics_batch:
        upsert_metrics(conn, metrics_batch)

    conn.commit()
    print(f"  Processed {processed} player-weeks for {season}.")
    return processed


def upsert_stats(conn, batch):
    conn.executemany("""
        INSERT INTO player_week_stats (
            player_id, season, week, season_type, team, opponent_team,
            fantasy_points_ppr, fantasy_points_half_ppr, fantasy_points_std,
            passing_yards, passing_tds, rushing_yards, rushing_tds,
            receiving_yards, receiving_tds, receptions, interceptions,
            rushing_fumbles_lost, targets, carries, completions, attempts,
            passing_air_yards, receiving_air_yards, receiving_yards_after_catch,
            touchdowns, turnovers,
            passing_first_downs, rushing_first_downs, receiving_first_downs,
            sacks_taken, sack_yards_lost, rushing_fumbles,
            receiving_fumbles, receiving_fumbles_lost,
            sack_fumbles, sack_fumbles_lost, fumbles, fumbles_lost,
            offense_snaps, offense_pct,
            stats_json, source, updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(player_id, season, week, season_type, source)
        DO UPDATE SET
            team=excluded.team, opponent_team=excluded.opponent_team,
            fantasy_points_ppr=excluded.fantasy_points_ppr,
            fantasy_points_half_ppr=excluded.fantasy_points_half_ppr,
            fantasy_points_std=excluded.fantasy_points_std,
            passing_yards=excluded.passing_yards, passing_tds=excluded.passing_tds,
            rushing_yards=excluded.rushing_yards, rushing_tds=excluded.rushing_tds,
            receiving_yards=excluded.receiving_yards, receiving_tds=excluded.receiving_tds,
            receptions=excluded.receptions, interceptions=excluded.interceptions,
            rushing_fumbles_lost=excluded.rushing_fumbles_lost,
            targets=excluded.targets, carries=excluded.carries,
            completions=excluded.completions, attempts=excluded.attempts,
            passing_air_yards=excluded.passing_air_yards,
            receiving_air_yards=excluded.receiving_air_yards,
            receiving_yards_after_catch=excluded.receiving_yards_after_catch,
            touchdowns=excluded.touchdowns, turnovers=excluded.turnovers,
            passing_first_downs=excluded.passing_first_downs,
            rushing_first_downs=excluded.rushing_first_downs,
            receiving_first_downs=excluded.receiving_first_downs,
            sacks_taken=excluded.sacks_taken, sack_yards_lost=excluded.sack_yards_lost,
            rushing_fumbles=excluded.rushing_fumbles,
            receiving_fumbles=excluded.receiving_fumbles,
            receiving_fumbles_lost=excluded.receiving_fumbles_lost,
            sack_fumbles=excluded.sack_fumbles, sack_fumbles_lost=excluded.sack_fumbles_lost,
            fumbles=excluded.fumbles, fumbles_lost=excluded.fumbles_lost,
            offense_snaps=COALESCE(excluded.offense_snaps, player_week_stats.offense_snaps),
            offense_pct=COALESCE(excluded.offense_pct, player_week_stats.offense_pct),
            stats_json=excluded.stats_json, updated_at=excluded.updated_at
    """, batch)


def upsert_metrics(conn, batch):
    conn.executemany("""
        INSERT INTO player_week_metrics (player_id, season, week, season_type, source, stat_key, stat_value, updated_at)
        VALUES (?,?,?,?,?,?,?,?)
        ON CONFLICT(player_id, season, week, season_type, source, stat_key)
        DO UPDATE SET stat_value=excluded.stat_value, updated_at=excluded.updated_at
    """, batch)


# ---------------------------------------------------------------------------
# Roster enrichment — age, height, weight, college, years_exp
# ---------------------------------------------------------------------------

ROSTER_URL = "https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_{season}.csv"


# ---------------------------------------------------------------------------
# Snap count enrichment
# ---------------------------------------------------------------------------

def sync_snap_counts(conn, seasons=None):
    """Fetch nflverse snap_counts CSVs and merge offense snap data into player_week_stats."""
    if seasons is None:
        seasons = [current_nfl_season()]

    total_updated = 0
    gsis_map, name_map, name_pos_map = build_player_lookup(conn)

    for season in seasons:
        url = SNAP_COUNTS_URL.format(season=season)
        print(f"  Fetching snap counts for {season}...")
        try:
            rows = fetch_csv(url)
        except Exception as e:
            print(f"  Snap counts {season} fetch failed: {e}")
            continue

        print(f"  Got {len(rows)} snap count rows.")
        batch = []
        for row in rows:
            game_type = (row.get("game_type") or "REG").strip().upper()
            if game_type not in ("REG", "REGULAR"):
                continue

            week = safe_int(row.get("week"))
            if week is None:
                continue

            pfr_id = (row.get("pfr_player_id") or "").strip()
            player_name = (row.get("player") or "").strip()
            team = (row.get("team") or "").strip().upper()
            search = normalize_name(player_name)
            pid = None

            # 1) Try name+team+position (exact match)
            for pos in ("QB", "RB", "WR", "TE", "FB", "K", "P"):
                if (search, team, pos) in name_map:
                    pid = name_map[(search, team, pos)]
                    break

            # 2) Fallback: name+position without team (handles stale players.team)
            if not pid:
                for pos in ("QB", "RB", "WR", "TE", "FB", "K", "P"):
                    if (search, pos) in name_pos_map:
                        pid = name_pos_map[(search, pos)]
                        break

            # 3) Try gsis_map in case pfr_id overlaps
            if not pid:
                if pfr_id and pfr_id in gsis_map:
                    pid = gsis_map[pfr_id]

            if not pid:
                continue

            off_snaps = safe_float(row.get("offense_snaps"))
            off_pct = safe_float(row.get("offense_pct"))
            if off_pct is not None:
                off_pct = round(off_pct * 100, 1) if off_pct <= 1.0 else round(off_pct, 1)

            batch.append((off_snaps, off_pct, pid, season, week))

        # Batch update
        if batch:
            conn.executemany("""
                UPDATE player_week_stats
                SET offense_snaps = ?, offense_pct = ?
                WHERE player_id = ? AND season = ? AND week = ?
                  AND season_type = 'regular' AND source = 'nflverse'
            """, batch)
            conn.commit()
            updated = sum(1 for _ in batch)
            total_updated += updated
            print(f"  Updated {updated} snap count rows for {season}.")

    return total_updated


def sync_rosters(conn, seasons=None):
    """Fetch nflverse roster CSVs and enrich players table with demographics."""
    if seasons is None:
        seasons = [current_nfl_season()]

    enriched = 0
    for season in seasons:
        url = ROSTER_URL.format(season=season)
        print(f"  Fetching roster for {season}...")
        try:
            rows = fetch_csv(url)
        except Exception as e:
            print(f"  Roster {season} fetch failed: {e}")
            continue

        for row in rows:
            gsis = (row.get("gsis_id") or "").strip()
            if not gsis:
                continue

            # Compute age from birth_date
            age = None
            bd = (row.get("birth_date") or "").strip()
            if bd:
                try:
                    birth = datetime.strptime(bd, "%Y-%m-%d")
                    today = datetime.now()
                    age = round((today - birth).days / 365.25, 1)
                except Exception:
                    pass

            years_exp = safe_int(row.get("years_exp"))
            height = (row.get("height") or "").strip() or None
            weight = safe_int(row.get("weight"))
            college = (row.get("college") or "").strip() or None
            status = (row.get("status") or "").strip() or None
            jersey = safe_int(row.get("jersey_number"))
            headshot = (row.get("headshot_url") or "").strip() or None

            # Update existing player by gsis_id match
            result = conn.execute("""
                UPDATE players SET
                    age = COALESCE(?, age),
                    years_exp = COALESCE(?, years_exp),
                    height = COALESCE(?, height),
                    weight = COALESCE(?, weight),
                    college = COALESCE(?, college),
                    status = COALESCE(?, status),
                    jersey_number = COALESCE(?, jersey_number),
                    headshot_url = COALESCE(?, headshot_url),
                    updated_at = ?
                WHERE gsis_id = ? OR player_id = ?
            """, (age, years_exp, height, weight, college, status, jersey,
                  headshot, utc_now(), gsis, gsis))

            if result.rowcount > 0:
                enriched += 1

    conn.commit()
    print(f"  Enriched {enriched} players with roster demographics.")
    return enriched


def sync_headshots(conn):
    """Fetch nflverse players.csv and backfill headshot_url for all players."""
    print("  Fetching nflverse players.csv for headshots...")
    try:
        rows = fetch_csv(PLAYERS_URL)
    except Exception as e:
        print(f"  Players CSV fetch failed: {e}")
        return 0

    updated = 0
    for row in rows:
        gsis = (row.get("gsis_id") or "").strip()
        if not gsis:
            continue
        headshot = (row.get("headshot_url") or row.get("headshot") or "").strip()
        if not headshot:
            continue
        result = conn.execute(
            "UPDATE players SET headshot_url = ? WHERE (gsis_id = ? OR player_id = ?) AND (headshot_url IS NULL OR headshot_url = '')",
            (headshot, gsis, gsis),
        )
        if result.rowcount > 0:
            updated += 1

    conn.commit()
    print(f"  Updated {updated} player headshots from nflverse players.csv.")
    return updated


# ---------------------------------------------------------------------------
# Play-by-play extraction
# ---------------------------------------------------------------------------

def _new_pbp_accum():
    """Create a fresh pbp accumulator dict for one player-season."""
    return {
        # Success rate
        "pass_plays": 0, "pass_successes": 0,
        "rush_plays": 0, "rush_successes": 0,
        # RYOE
        "total_ryoe": 0.0, "ryoe_carries": 0,
        # Game script
        "score_diffs": [],
        # Play-action
        "pa_att": 0, "pa_comp": 0, "pa_yds": 0.0, "pa_td": 0,
        # Scramble
        "scram_att": 0, "scram_yds": 0.0, "scram_td": 0,
        # Garbage time
        "total_plays": 0, "garbage_plays": 0,
        # Goal-line
        "gl_carries": 0, "gl_targets": 0, "gl_tds": 0,
        # Two-point
        "two_pt": 0,
        # Returns
        "return_yds": 0.0, "return_tds": 0,
        # Intended air yards (receiver-side)
        "intended_air_yds": 0.0, "target_count": 0,
        # Drops
        "drops": 0,
    }


def sync_pbp_data(conn, seasons=None):
    """Fetch nflverse play-by-play CSVs and extract advanced stats per player-season."""
    if seasons is None:
        seasons = [current_nfl_season()]

    gsis_map, name_map, _ = build_player_lookup(conn)

    for season in seasons:
        url = PBP_URL.format(season=season)
        print(f"  Fetching play-by-play for {season} (large file)...")
        try:
            req = urllib.request.Request(url)
            req.add_header("User-Agent", "razzle-adapter/1.0")
            with urllib.request.urlopen(req, timeout=300) as resp:
                raw = resp.read()
            raw = gzip.decompress(raw)
            text = raw.decode("utf-8-sig")
        except Exception as e:
            print(f"  PBP {season} fetch failed: {e}")
            continue

        reader = csv.DictReader(io.StringIO(text))

        # Accumulators: gsis_id -> _new_pbp_accum()
        accum = {}

        def get_accum(gsis_id):
            if not gsis_id or gsis_id == "NA":
                return None
            if gsis_id not in accum:
                accum[gsis_id] = _new_pbp_accum()
            return accum[gsis_id]

        row_count = 0
        for row in reader:
            row_count += 1
            # Only regular season
            season_type = (row.get("season_type") or "").upper()
            if season_type not in ("REG", "REGULAR"):
                continue

            play_type = (row.get("play_type") or "").lower()
            if play_type not in ("pass", "run", "qb_kneel", "qb_spike"):
                # Check for special teams (kickoff, punt) for return stats
                if play_type in ("kickoff", "punt"):
                    _process_return_play(row, get_accum)
                continue

            epa = safe_float(row.get("epa"))
            score_diff = safe_float(row.get("score_differential"))
            qtr = safe_int(row.get("qtr")) or 0
            yardline = safe_float(row.get("yardline_100"))

            # Determine garbage time: |score_diff| > 14 in Q4, or > 21 in Q3
            is_garbage = False
            if score_diff is not None:
                if (qtr == 4 and abs(score_diff) > 14) or (qtr == 3 and abs(score_diff) > 21):
                    is_garbage = True

            # Two-point attempt check
            two_pt = (row.get("two_point_attempt") or "0").strip()
            is_two_pt = two_pt == "1" or two_pt.lower() == "true"
            two_pt_result = (row.get("two_point_conv_result") or "").lower()
            is_two_pt_success = is_two_pt and two_pt_result == "success"

            # Goal-line check (inside 5-yard line)
            is_goal_line = yardline is not None and yardline <= 5

            # --- PASSING PLAYS ---
            if play_type == "pass":
                passer_id = (row.get("passer_player_id") or "").strip()
                receiver_id = (row.get("receiver_player_id") or "").strip()
                is_complete = (row.get("complete_pass") or "0").strip() == "1"
                pass_yards = safe_float(row.get("passing_yards")) or 0
                air_yards = safe_float(row.get("air_yards"))
                is_td = (row.get("pass_touchdown") or "0").strip() == "1"
                is_interception = (row.get("interception") or "0").strip() == "1"
                is_play_action = (row.get("is_play_action") or "0").strip()
                is_play_action = is_play_action == "1" or is_play_action.lower() == "true"
                # Fallback: detect play-action from play description
                if not is_play_action:
                    desc = (row.get("desc") or "").lower()
                    if "play action" in desc or "play-action" in desc or "play fake" in desc:
                        is_play_action = True
                # Passer stats (non-scramble passes — scrambles handled in run block)
                pa = get_accum(passer_id)
                if pa:
                    pa["pass_plays"] += 1
                    if epa is not None and epa > 0:
                        pa["pass_successes"] += 1

                    # Play-action
                    if is_play_action:
                        pa["pa_att"] += 1
                        if is_complete:
                            pa["pa_comp"] += 1
                        pa["pa_yds"] += pass_yards
                        if is_td:
                            pa["pa_td"] += 1

                    # Game script + garbage time
                    if score_diff is not None:
                        pa["score_diffs"].append(score_diff)
                    pa["total_plays"] += 1
                    if is_garbage:
                        pa["garbage_plays"] += 1

                    # Two-point (passer)
                    if is_two_pt_success:
                        pa["two_pt"] += 1

                # Receiver stats
                ra = get_accum(receiver_id)
                if ra:
                    # Intended air yards (all targets, not just completions)
                    if air_yards is not None:
                        ra["intended_air_yds"] += air_yards
                    ra["target_count"] += 1

                    # Drop detection: incomplete, not intercepted, short-medium throw
                    if not is_complete and not is_interception:
                        if air_yards is not None and air_yards < 15:
                            ra["drops"] += 1

                    # Goal-line targets
                    if is_goal_line:
                        ra["gl_targets"] += 1
                        if is_td:
                            ra["gl_tds"] += 1

                    # Two-point (receiver)
                    if is_two_pt_success and is_complete:
                        ra["two_pt"] += 1

                    # Game script + garbage for receiver
                    if score_diff is not None:
                        ra["score_diffs"].append(score_diff)
                    ra["total_plays"] += 1
                    if is_garbage:
                        ra["garbage_plays"] += 1

            # --- RUSHING PLAYS ---
            elif play_type == "run":
                rusher_id = (row.get("rusher_player_id") or "").strip()
                rush_yards = safe_float(row.get("rushing_yards")) or 0
                expected_yds = safe_float(row.get("xyac_mean_yardage"))
                if expected_yds is None:
                    expected_yds = safe_float(row.get("expected_yards"))
                is_td = (row.get("rush_touchdown") or "0").strip() == "1"
                is_scramble = (row.get("qb_scramble") or "0").strip() == "1"

                ru = get_accum(rusher_id)
                if ru:
                    # Scramble stats (QB scrambles classified as run plays)
                    if is_scramble:
                        ru["scram_att"] += 1
                        ru["scram_yds"] += rush_yards
                        if is_td:
                            ru["scram_td"] += 1
                    else:
                        # Success rate (only designed runs, not scrambles)
                        ru["rush_plays"] += 1
                        if epa is not None and epa > 0:
                            ru["rush_successes"] += 1

                        # RYOE (designed runs only)
                        if expected_yds is not None:
                            ru["total_ryoe"] += (rush_yards - expected_yds)
                            ru["ryoe_carries"] += 1

                    # Game script + garbage (all rushing plays)
                    if score_diff is not None:
                        ru["score_diffs"].append(score_diff)
                    ru["total_plays"] += 1
                    if is_garbage:
                        ru["garbage_plays"] += 1

                    # Goal-line carries
                    if is_goal_line:
                        ru["gl_carries"] += 1
                        if is_td:
                            ru["gl_tds"] += 1

                    # Two-point
                    if is_two_pt_success:
                        ru["two_pt"] += 1

        print(f"  Processed {row_count} pbp rows for {season}, {len(accum)} players.")

        # Write aggregated stats to player_season_pbp
        batch = []
        for gsis_id, a in accum.items():
            pid = gsis_map.get(gsis_id)
            if not pid:
                continue

            pass_sr = round(a["pass_successes"] / a["pass_plays"], 3) if a["pass_plays"] > 0 else None
            rush_sr = round(a["rush_successes"] / a["rush_plays"], 3) if a["rush_plays"] > 0 else None
            ryoe = round(a["total_ryoe"], 1) if a["ryoe_carries"] > 0 else None
            ryoe_pc = round(a["total_ryoe"] / a["ryoe_carries"], 2) if a["ryoe_carries"] > 0 else None
            avg_sd = round(sum(a["score_diffs"]) / len(a["score_diffs"]), 1) if a["score_diffs"] else None
            gt_pct = round(a["garbage_plays"] / a["total_plays"], 3) if a["total_plays"] > 0 else None
            iay_pt = round(a["intended_air_yds"] / a["target_count"], 1) if a["target_count"] > 0 else None
            dr = round(a["drops"] / a["target_count"], 3) if a["target_count"] > 0 else None

            batch.append((
                pid, season,
                pass_sr, rush_sr, ryoe, ryoe_pc, avg_sd,
                a["pa_att"] or None, a["pa_comp"] or None,
                a["pa_yds"] if a["pa_att"] > 0 else None,
                a["pa_td"] or None,
                a["scram_att"] or None, a["scram_yds"] if a["scram_att"] > 0 else None,
                a["scram_td"] or None,
                gt_pct,
                a["gl_carries"] or None, a["gl_targets"] or None, a["gl_tds"] or None,
                a["two_pt"] or None,
                a["return_yds"] if a["return_yds"] > 0 else None,
                a["return_tds"] or None,
                a["intended_air_yds"] if a["target_count"] > 0 else None, iay_pt,
                a["drops"] or None, dr,
                utc_now(),
            ))

        if batch:
            conn.executemany("""
                INSERT OR REPLACE INTO player_season_pbp (
                    player_id, season,
                    pass_success_rate, rush_success_rate, total_ryoe, ryoe_per_carry, avg_score_differential,
                    play_action_attempts, play_action_completions, play_action_yards, play_action_tds,
                    scramble_attempts, scramble_yards, scramble_tds,
                    garbage_time_pct,
                    gl_carries, gl_targets, gl_tds,
                    two_point_conversions,
                    return_yards, return_tds,
                    intended_air_yards, intended_air_yards_per_target,
                    drops, drop_rate,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, batch)
            conn.commit()
            print(f"  Wrote {len(batch)} player-season pbp rows for {season}.")


def _process_return_play(row, get_accum):
    """Process kickoff/punt return plays for return stats."""
    play_type = (row.get("play_type") or "").lower()

    if play_type == "kickoff":
        returner_id = (row.get("kickoff_returner_player_id") or "").strip()
        ret_yds = safe_float(row.get("return_yards")) or 0
        # Check for return TD
        is_td = (row.get("return_touchdown") or "0").strip() == "1"
    elif play_type == "punt":
        returner_id = (row.get("punt_returner_player_id") or "").strip()
        ret_yds = safe_float(row.get("return_yards")) or 0
        is_td = (row.get("return_touchdown") or "0").strip() == "1"
    else:
        return

    ra = get_accum(returner_id)
    if ra and ret_yds != 0:
        ra["return_yds"] += ret_yds
        if is_td:
            ra["return_tds"] += 1


# ---------------------------------------------------------------------------
# Bye week + injury extraction
# ---------------------------------------------------------------------------

def sync_bye_weeks(conn, seasons=None):
    """Fetch schedule data and compute bye weeks per team per season."""
    if seasons is None:
        seasons = [current_nfl_season()]

    print(f"  Fetching schedule data...")
    try:
        rows = fetch_csv(SCHEDULE_URL)
    except Exception as e:
        print(f"  Schedule fetch failed: {e}")
        return

    # Compute bye weeks: find the missing week for each team in each season
    # team -> season -> set of weeks played
    team_weeks = {}
    for row in rows:
        s = safe_int(row.get("season"))
        if s not in seasons:
            continue
        if (row.get("game_type") or "").upper() != "REG":
            continue
        week = safe_int(row.get("week"))
        if not week:
            continue
        for team_col in ("home_team", "away_team"):
            team = (row.get(team_col) or "").strip().upper()
            if not team:
                continue
            key = (team, s)
            if key not in team_weeks:
                team_weeks[key] = set()
            team_weeks[key].add(week)

    # Find bye week = the missing week in regular season (1-18)
    bye_map = {}  # (team, season) -> bye_week
    for (team, season), played in team_weeks.items():
        all_weeks = set(range(1, 19))
        missing = all_weeks - played
        if missing:
            bye_map[(team, season)] = min(missing)

    # Update player_season_pbp with bye weeks based on player team
    updated = 0
    for (team, season), bye in bye_map.items():
        # Get player_ids for this team in this season
        result = conn.execute("""
            UPDATE player_season_pbp SET bye_week = ?
            WHERE season = ? AND player_id IN (
                SELECT DISTINCT player_id FROM player_week_stats
                WHERE season = ? AND team = ?
            )
        """, (bye, season, season, team))
        updated += result.rowcount

    conn.commit()
    print(f"  Updated {updated} bye week entries across {len(bye_map)} team-seasons.")


def sync_injuries(conn, seasons=None):
    """Fetch nflverse injury data and compute games_missed per player per season."""
    if seasons is None:
        seasons = [current_nfl_season()]

    gsis_map, name_map, _ = build_player_lookup(conn)

    for season in seasons:
        url = INJURIES_URL.format(season=season)
        print(f"  Fetching injury data for {season}...")
        try:
            rows = fetch_csv(url)
        except Exception as e:
            print(f"  Injuries {season} fetch failed: {e}")
            continue

        # Count games missed: report_status in (Out, Injured Reserve, Doubtful)
        # gsis_id -> count of weeks with Out/IR designation
        missed = {}
        for row in rows:
            if (row.get("game_type") or "").upper() != "REG":
                continue
            gsis = (row.get("gsis_id") or "").strip()
            status = (row.get("report_status") or "").strip().lower()
            if status in ("out", "injured reserve", "doubtful"):
                missed[gsis] = missed.get(gsis, 0) + 1

        # Update player_season_pbp
        updated = 0
        for gsis, count in missed.items():
            pid = gsis_map.get(gsis)
            if not pid:
                continue
            conn.execute("""
                UPDATE player_season_pbp SET games_missed = ?
                WHERE player_id = ? AND season = ?
            """, (count, pid, season))
            updated += 1

        conn.commit()
        print(f"  Updated {updated} injury entries for {season}.")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def migrate_add_columns(conn):
    """Add Phase 29 columns to existing player_week_stats tables (idempotent)."""
    new_cols = [
        ("passing_first_downs", "REAL"),
        ("rushing_first_downs", "REAL"),
        ("receiving_first_downs", "REAL"),
        ("sacks_taken", "REAL"),
        ("sack_yards_lost", "REAL"),
        ("rushing_fumbles", "REAL"),
        ("receiving_fumbles", "REAL"),
        ("receiving_fumbles_lost", "REAL"),
        ("sack_fumbles", "REAL"),
        ("sack_fumbles_lost", "REAL"),
        ("fumbles", "REAL"),
        ("fumbles_lost", "REAL"),
        ("offense_snaps", "REAL"),
        ("offense_pct", "REAL"),
    ]
    existing = {row[1] for row in conn.execute("PRAGMA table_info(player_week_stats)").fetchall()}
    for col_name, col_type in new_cols:
        if col_name not in existing:
            conn.execute(f"ALTER TABLE player_week_stats ADD COLUMN {col_name} {col_type}")
            print(f"  Added column: {col_name}")

    # Phase 55: Add headshot_url to players table
    players_cols = {row[1] for row in conn.execute("PRAGMA table_info(players)").fetchall()}
    if "headshot_url" not in players_cols:
        conn.execute("ALTER TABLE players ADD COLUMN headshot_url TEXT")
        print("  Added column: headshot_url to players")

    # Phase 66: Add fantasy_relevant to players table (default 1 for all)
    if "fantasy_relevant" not in players_cols:
        conn.execute("ALTER TABLE players ADD COLUMN fantasy_relevant INTEGER DEFAULT 1")
        conn.execute("UPDATE players SET fantasy_relevant = 1 WHERE fantasy_relevant IS NULL")
        print("  Added column: fantasy_relevant to players")

    # Index on fantasy_relevant (must be after column exists)
    try:
        conn.execute("CREATE INDEX IF NOT EXISTS idx_players_pos_relevant ON players(position, fantasy_relevant)")
    except Exception:
        pass  # Index may already exist

    conn.commit()


def migrate_pbp_columns(conn):
    """Add bye_week and games_missed to existing player_season_pbp (idempotent)."""
    try:
        existing = {row[1] for row in conn.execute("PRAGMA table_info(player_season_pbp)").fetchall()}
    except Exception:
        return  # table doesn't exist yet
    for col_name, col_type in [("bye_week", "INTEGER"), ("games_missed", "INTEGER")]:
        if col_name not in existing:
            conn.execute(f"ALTER TABLE player_season_pbp ADD COLUMN {col_name} {col_type}")
            print(f"  Added pbp column: {col_name}")
    conn.commit()


def current_nfl_season():
    now = datetime.now()
    return now.year if now.month >= 8 else now.year - 1


def main():
    global LEAN
    if "--lean" in sys.argv:
        LEAN = True
        sys.argv.remove("--lean")

    seasons = list(range(2015, current_nfl_season() + 1))

    if len(sys.argv) > 1 and sys.argv[1] == "--seasons":
        seasons = [int(s) for s in sys.argv[2:]]

    print(f"Razzle nflverse adapter — syncing seasons: {seasons}" + (" [lean]" if LEAN else ""))
    conn = get_connection()
    try:
        initialize_database(conn)

        # Migrate existing DB to add new columns (idempotent)
        print("Checking for schema migrations...")
        migrate_add_columns(conn)
        migrate_pbp_columns(conn)

        total = 0
        for season in seasons:
            total += process_season(conn, season)

        # Enrich with snap counts
        print(f"\nSyncing snap counts...")
        sync_snap_counts(conn, sorted(seasons))

        if not LEAN:
            print(f"\nExtracting play-by-play stats...")
            sync_pbp_data(conn, sorted(seasons))
            print(f"\nSyncing bye weeks and injuries...")
            sync_bye_weeks(conn, sorted(seasons))
            sync_injuries(conn, sorted(seasons))
        else:
            print("\n[lean] skipped PBP, injuries, metrics EAV")

        print(f"\nEnriching players with roster demographics...")
        sync_rosters(conn, sorted(seasons))

        if not LEAN:
            print(f"\nBackfilling player headshots...")
            sync_headshots(conn)

        # Apply known upstream data corrections before aggregation
        print("\nApplying stat corrections...")
        apply_stat_corrections(conn, seasons)

        # Refresh players.team from most recent game data
        print("\nRefreshing players.team from latest game data...")
        conn.execute("""
            UPDATE players SET team = (
                SELECT s.team FROM player_week_stats s
                WHERE s.player_id = players.player_id
                    AND s.team IS NOT NULL AND s.team != ''
                ORDER BY s.season DESC, s.week DESC LIMIT 1
            ), updated_at = ?
            WHERE player_id IN (
                SELECT DISTINCT player_id FROM player_week_stats
            )
        """, (utc_now(),))
        conn.commit()
        team_updated = conn.execute("""
            SELECT COUNT(*) FROM players WHERE team IS NOT NULL
        """).fetchone()[0]
        print(f"  Updated team for {team_updated} players")

        # Build player_season_stats aggregate table
        print("\nBuilding player_season_stats aggregate table...")
        conn.execute("DROP TABLE IF EXISTS player_season_stats")
        conn.execute("""
            CREATE TABLE player_season_stats AS
            SELECT
                player_id, season,
                COUNT(DISTINCT week) as games,
                SUM(passing_yards) as passing_yards,
                SUM(passing_tds) as passing_tds,
                SUM(interceptions) as interceptions,
                SUM(rushing_yards) as rushing_yards,
                SUM(rushing_tds) as rushing_tds,
                SUM(receiving_yards) as receiving_yards,
                SUM(receiving_tds) as receiving_tds,
                SUM(receptions) as receptions,
                SUM(carries) as carries,
                SUM(targets) as targets,
                SUM(touchdowns) as touchdowns,
                SUM(turnovers) as turnovers,
                ROUND(SUM(fantasy_points_ppr), 2) as fantasy_points_ppr,
                ROUND(SUM(fantasy_points_half_ppr), 2) as fantasy_points_half_ppr,
                ROUND(SUM(fantasy_points_std), 2) as fantasy_points_std,
                SUM(completions) as completions,
                SUM(attempts) as attempts,
                SUM(offense_snaps) as offense_snaps,
                AVG(offense_pct) as offense_pct
            FROM player_week_stats
            WHERE season_type = 'regular'
            GROUP BY player_id, season
        """)
        conn.execute("CREATE INDEX idx_pss_player_season ON player_season_stats(player_id, season)")
        conn.execute("CREATE INDEX idx_pss_season ON player_season_stats(season)")
        conn.commit()
        pss_count = conn.execute("SELECT COUNT(*) FROM player_season_stats").fetchone()[0]
        print(f"  player_season_stats: {pss_count} rows")

        # Update sync state
        conn.execute("""
            INSERT OR REPLACE INTO sync_state (key, value, updated_at)
            VALUES ('last_nflverse_sync', ?, ?)
        """, (json.dumps({"seasons": seasons, "total_rows": total}), utc_now()))
        conn.commit()

        # Quick summary
        player_count = conn.execute("SELECT COUNT(*) FROM players").fetchone()[0]
        stat_count = conn.execute("SELECT COUNT(*) FROM player_week_stats").fetchone()[0]
        age_count = conn.execute("SELECT COUNT(*) FROM players WHERE age IS NOT NULL").fetchone()[0]
        print(f"\nDone. {player_count} players ({age_count} with age), {stat_count} stat rows in terminal.db")

        # Bust data cache so server sees fresh results
        try:
            from backend.live_data.core import cache_clear
            cache_clear()
        except Exception:
            pass  # Adapters may run standalone outside the server process
    finally:
        conn.close()


if __name__ == "__main__":
    main()
