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
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"

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


def normalize_name(name):
    if not name:
        return ""
    name = name.lower().strip()
    name = re.sub(r"\s+(jr|sr|ii|iii|iv|v)\.?$", "", name)
    name = re.sub(r"[^a-z]", "", name)
    return name


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
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), timeout=60)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    return conn


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
        CREATE INDEX IF NOT EXISTS idx_pws_fpts ON player_week_stats(fantasy_points_ppr);

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

    We want: player_stats_YYYY.csv (weekly offensive stats)
    We skip: player_stats_def_*, player_stats_kicking_*, player_stats_season_*
    """
    req = urllib.request.Request(NFLVERSE_RELEASES_URL)
    req.add_header("User-Agent", "razzle-adapter/1.0")

    with urllib.request.urlopen(req, timeout=30) as resp:
        releases = json.loads(resp.read().decode())

    best = None
    best_score = -1

    for release in releases:
        for asset in release.get("assets", []):
            name = asset.get("name", "").lower()
            url = asset.get("browser_download_url", "")
            if not url:
                continue

            # Must be a CSV (possibly gzipped)
            if not (name.endswith(".csv") or name.endswith(".csv.gz")):
                continue

            # Must look like player stats
            if "player_stats" not in name:
                continue

            # Skip defensive, kicking, and season-aggregate files
            if "def" in name or "kicking" in name or "season" in name:
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

            if score > best_score:
                best_score = score
                best = {"name": asset["name"], "url": url, "score": score}

    return best


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
    """Build gsis_id -> player_id and (name, team, pos) -> player_id maps."""
    gsis_map = {}
    name_map = {}
    for row in conn.execute("SELECT player_id, gsis_id, search_name, team, position FROM players"):
        if row["gsis_id"]:
            gsis_map[row["gsis_id"]] = row["player_id"]
        if row["search_name"]:
            name_map[(row["search_name"], row["team"], row["position"])] = row["player_id"]
    return gsis_map, name_map


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
    """Create a player record from nflverse CSV data. Returns player_id."""
    gsis = row.get("player_id", "").strip()
    player_id = gsis if gsis else f"nfl_{normalize_name(row.get('player_display_name', ''))}"

    name = row.get("player_display_name") or row.get("player_name") or ""
    parts = name.split(None, 1)
    first = parts[0] if parts else ""
    last = parts[1] if len(parts) > 1 else ""
    team = (row.get("recent_team") or "").strip().upper()
    pos = (row.get("position") or row.get("position_group") or "").strip().upper()

    conn.execute("""
        INSERT OR IGNORE INTO players (player_id, full_name, first_name, last_name,
            search_name, position, team, gsis_id, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (player_id, name, first, last, normalize_name(name), pos, team, gsis, utc_now()))

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

    print(f"  Downloading {asset['name']}...")
    rows = fetch_csv(asset["url"])
    print(f"  Got {len(rows)} rows from CSV.")

    gsis_map, name_map = build_player_lookup(conn)

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

        # Resolve or backfill player
        pid = resolve_player_id(row, gsis_map, name_map)
        if not pid:
            pid = backfill_player(conn, row, gsis_map, name_map)

        team = (row.get("recent_team") or "").strip().upper()
        opp = (row.get("opponent_team") or "").strip().upper()

        # Core stat extraction
        core = {}
        for csv_key, db_key in CORE_STATS.items():
            core[db_key] = safe_float(row.get(csv_key))

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
            json.dumps({k: v for k, v in row.items() if v and v != "NA"}),
            "nflverse",
            now,
        ))

        # All numeric metrics (ELT — keep everything)
        metrics = extract_metrics(row)
        for stat_key, stat_value in metrics.items():
            metrics_batch.append((pid, s, w, season_type, "nflverse", stat_key, stat_value, now))

        processed += 1

        # Batch insert periodically
        if len(stats_batch) >= 250:
            upsert_stats(conn, stats_batch)
            stats_batch = []
        if len(metrics_batch) >= 10000:
            upsert_metrics(conn, metrics_batch)
            metrics_batch = []

    # Flush remaining
    if stats_batch:
        upsert_stats(conn, stats_batch)
    if metrics_batch:
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
    gsis_map, name_map = build_player_lookup(conn)

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

            # Resolve player via pfr_player_id or name+team
            pfr_id = (row.get("pfr_player_id") or "").strip()
            player_name = (row.get("player") or "").strip()
            team = (row.get("team") or "").strip().upper()

            # Try gsis lookup by pfr_id (won't match, different ID space)
            # Use name+team+position matching instead
            search = normalize_name(player_name)
            pid = None

            # Try all positions for this name+team combo
            for pos in ("QB", "RB", "WR", "TE", "FB", "K", "P"):
                if (search, team, pos) in name_map:
                    pid = name_map[(search, team, pos)]
                    break

            if not pid:
                # Try gsis_map in case pfr_id overlaps
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
                    updated_at = ?
                WHERE gsis_id = ? OR player_id = ?
            """, (age, years_exp, height, weight, college, status, jersey,
                  utc_now(), gsis, gsis))

            if result.rowcount > 0:
                enriched += 1

    conn.commit()
    print(f"  Enriched {enriched} players with roster demographics.")
    return enriched


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
    conn.commit()


def current_nfl_season():
    now = datetime.now()
    return now.year if now.month >= 8 else now.year - 1


def main():
    seasons = [current_nfl_season()]

    if len(sys.argv) > 1 and sys.argv[1] == "--seasons":
        seasons = [int(s) for s in sys.argv[2:]]

    print(f"Razzle nflverse adapter — syncing seasons: {seasons}")
    conn = get_connection()
    initialize_database(conn)

    # Migrate existing DB to add new columns (idempotent)
    print("Checking for schema migrations...")
    migrate_add_columns(conn)

    total = 0
    for season in seasons:
        total += process_season(conn, season)

    # Enrich with snap counts
    print(f"\nSyncing snap counts...")
    sync_snap_counts(conn, sorted(seasons))

    # Enrich players with age/demographics from roster CSVs
    print(f"\nEnriching players with roster demographics...")
    sync_rosters(conn, sorted(seasons))

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
    conn.close()


if __name__ == "__main__":
    main()
