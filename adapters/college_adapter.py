"""
College/prospect adapter — fetches combine data and draft picks CSVs
from nflverse GitHub releases, normalizes to SQLite (data/terminal.db).

Data sources:
  - combine.csv: NFL Combine athletic testing (40, bench, vertical, etc.)
  - draft_picks.csv: Draft capital + career NFL summary stats

Usage:
    python adapters/college_adapter.py [--years 2020 2021 2022 2023 2024 2025]
"""

import csv
import gzip
import io
import json
import re
import sqlite3
import sys
import urllib.request
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"

COMBINE_URL = "https://github.com/nflverse/nflverse-data/releases/download/combine/combine.csv"
DRAFT_PICKS_URL = "https://github.com/nflverse/nflverse-data/releases/download/draft_picks/draft_picks.csv"


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


def parse_height_inches(ht_str):
    """Convert height string like '6-4' or '6' 4\"' to total inches."""
    if not ht_str or ht_str in ("NA", "NaN", ""):
        return None
    # Try '6-4' format
    m = re.match(r"(\d+)-(\d+)", ht_str)
    if m:
        return int(m.group(1)) * 12 + int(m.group(2))
    # Try '6' 4"' or similar
    m = re.match(r"(\d+)['\u2019]\s*(\d+)", ht_str)
    if m:
        return int(m.group(1)) * 12 + int(m.group(2))
    # Try plain number (already inches)
    f = safe_float(ht_str)
    if f and f > 20:
        return int(f)
    return None


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


def initialize_tables(conn):
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS combine_data (
            cfb_id TEXT,
            pfr_id TEXT,
            player_name TEXT,
            position TEXT,
            school TEXT,
            draft_year INTEGER,
            draft_team TEXT,
            draft_round INTEGER,
            draft_pick INTEGER,
            height_inches INTEGER,
            weight INTEGER,
            forty REAL,
            bench INTEGER,
            vertical REAL,
            broad_jump INTEGER,
            cone REAL,
            shuttle REAL,
            source TEXT DEFAULT 'nflverse',
            updated_at TEXT,
            PRIMARY KEY (player_name, draft_year, position)
        );

        CREATE INDEX IF NOT EXISTS idx_combine_year ON combine_data(draft_year);
        CREATE INDEX IF NOT EXISTS idx_combine_pos ON combine_data(position);
        CREATE INDEX IF NOT EXISTS idx_combine_school ON combine_data(school);
        CREATE INDEX IF NOT EXISTS idx_combine_pfr ON combine_data(pfr_id);

        CREATE TABLE IF NOT EXISTS draft_picks (
            season INTEGER,
            round INTEGER,
            pick INTEGER,
            team TEXT,
            pfr_id TEXT,
            cfb_id TEXT,
            player_name TEXT,
            position TEXT,
            category TEXT,
            college TEXT,
            age REAL,
            hof TEXT,
            allpro INTEGER,
            probowls INTEGER,
            seasons_started INTEGER,
            career_av INTEGER,
            draft_av INTEGER,
            games INTEGER,
            pass_completions INTEGER,
            pass_attempts INTEGER,
            pass_yards INTEGER,
            pass_tds INTEGER,
            pass_ints INTEGER,
            rush_atts INTEGER,
            rush_yards INTEGER,
            rush_tds INTEGER,
            receptions INTEGER,
            rec_yards INTEGER,
            rec_tds INTEGER,
            def_solo_tackles REAL,
            def_ints INTEGER,
            def_sacks REAL,
            source TEXT DEFAULT 'nflverse',
            updated_at TEXT,
            PRIMARY KEY (season, round, pick)
        );

        CREATE INDEX IF NOT EXISTS idx_draft_season ON draft_picks(season);
        CREATE INDEX IF NOT EXISTS idx_draft_pos ON draft_picks(position);
        CREATE INDEX IF NOT EXISTS idx_draft_team ON draft_picks(team);
        CREATE INDEX IF NOT EXISTS idx_draft_pfr ON draft_picks(pfr_id);
        CREATE INDEX IF NOT EXISTS idx_draft_college ON draft_picks(college);
    """)
    conn.commit()


# ---------------------------------------------------------------------------
# CSV fetching
# ---------------------------------------------------------------------------

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
# Combine data processing
# ---------------------------------------------------------------------------

def process_combine(conn, years=None):
    """Fetch and insert combine data."""
    print("  Downloading combine.csv...")
    rows = fetch_csv(COMBINE_URL)
    print(f"  Got {len(rows)} combine rows.")

    now = utc_now()
    batch = []
    processed = 0

    for row in rows:
        draft_year = safe_int(row.get("season") or row.get("draft_year"))
        if draft_year is None:
            continue
        if years and draft_year not in years:
            continue

        name = (row.get("player_name") or "").strip()
        pos = (row.get("pos") or row.get("position") or "").strip().upper()
        if not name or not pos:
            continue

        # Skip non-fantasy positions for the prospect screener
        # But keep all positions in DB — filter in queries
        batch.append((
            (row.get("cfb_id") or "").strip(),
            (row.get("pfr_id") or "").strip(),
            name,
            pos,
            (row.get("school") or "").strip(),
            draft_year,
            (row.get("draft_team") or "").strip().upper(),
            safe_int(row.get("draft_round")),
            safe_int(row.get("draft_ovr") or row.get("draft_pick")),
            parse_height_inches(row.get("ht") or row.get("height")),
            safe_int(row.get("wt") or row.get("weight")),
            safe_float(row.get("forty")),
            safe_int(row.get("bench")),
            safe_float(row.get("vertical")),
            safe_int(row.get("broad_jump")),
            safe_float(row.get("cone")),
            safe_float(row.get("shuttle")),
            "nflverse",
            now,
        ))
        processed += 1

        if len(batch) >= 500:
            upsert_combine(conn, batch)
            batch = []

    if batch:
        upsert_combine(conn, batch)

    conn.commit()
    print(f"  Processed {processed} combine entries.")
    return processed


def upsert_combine(conn, batch):
    conn.executemany("""
        INSERT INTO combine_data (
            cfb_id, pfr_id, player_name, position, school,
            draft_year, draft_team, draft_round, draft_pick,
            height_inches, weight, forty, bench, vertical, broad_jump,
            cone, shuttle, source, updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(player_name, draft_year, position)
        DO UPDATE SET
            cfb_id=excluded.cfb_id, pfr_id=excluded.pfr_id,
            school=excluded.school, draft_team=excluded.draft_team,
            draft_round=excluded.draft_round, draft_pick=excluded.draft_pick,
            height_inches=excluded.height_inches, weight=excluded.weight,
            forty=excluded.forty, bench=excluded.bench,
            vertical=excluded.vertical, broad_jump=excluded.broad_jump,
            cone=excluded.cone, shuttle=excluded.shuttle,
            updated_at=excluded.updated_at
    """, batch)


# ---------------------------------------------------------------------------
# Draft picks processing
# ---------------------------------------------------------------------------

def process_draft_picks(conn, years=None):
    """Fetch and insert draft pick data."""
    print("  Downloading draft_picks.csv...")
    rows = fetch_csv(DRAFT_PICKS_URL)
    print(f"  Got {len(rows)} draft pick rows.")

    now = utc_now()
    batch = []
    processed = 0

    for row in rows:
        season = safe_int(row.get("season"))
        rd = safe_int(row.get("round"))
        pick = safe_int(row.get("pick"))
        if season is None or rd is None or pick is None:
            continue
        if years and season not in years:
            continue

        name = (row.get("pfr_player_name") or row.get("player_name") or "").strip()
        pos = (row.get("position") or "").strip().upper()

        batch.append((
            season, rd, pick,
            (row.get("team") or "").strip().upper(),
            (row.get("pfr_player_id") or row.get("pfr_id") or "").strip(),
            (row.get("cfb_player_id") or row.get("cfb_id") or "").strip(),
            name,
            pos,
            (row.get("category") or "").strip(),
            (row.get("college") or "").strip(),
            safe_float(row.get("age")),
            (row.get("hof") or "").strip(),
            safe_int(row.get("allpro")),
            safe_int(row.get("probowls")),
            safe_int(row.get("seasons_started")),
            safe_int(row.get("car_av") or row.get("career_av")),
            safe_int(row.get("dr_av") or row.get("draft_av")),
            safe_int(row.get("games")),
            safe_int(row.get("pass_completions")),
            safe_int(row.get("pass_attempts")),
            safe_int(row.get("pass_yards")),
            safe_int(row.get("pass_tds")),
            safe_int(row.get("pass_ints")),
            safe_int(row.get("rush_atts")),
            safe_int(row.get("rush_yards")),
            safe_int(row.get("rush_tds")),
            safe_int(row.get("receptions")),
            safe_int(row.get("rec_yards")),
            safe_int(row.get("rec_tds")),
            safe_float(row.get("def_solo_tackles")),
            safe_int(row.get("def_ints")),
            safe_float(row.get("def_sacks")),
            "nflverse",
            now,
        ))
        processed += 1

        if len(batch) >= 500:
            upsert_draft_picks(conn, batch)
            batch = []

    if batch:
        upsert_draft_picks(conn, batch)

    conn.commit()
    print(f"  Processed {processed} draft picks.")
    return processed


def upsert_draft_picks(conn, batch):
    conn.executemany("""
        INSERT INTO draft_picks (
            season, round, pick, team, pfr_id, cfb_id,
            player_name, position, category, college, age, hof,
            allpro, probowls, seasons_started, career_av, draft_av,
            games, pass_completions, pass_attempts, pass_yards, pass_tds,
            pass_ints, rush_atts, rush_yards, rush_tds,
            receptions, rec_yards, rec_tds,
            def_solo_tackles, def_ints, def_sacks,
            source, updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(season, round, pick)
        DO UPDATE SET
            team=excluded.team, pfr_id=excluded.pfr_id, cfb_id=excluded.cfb_id,
            player_name=excluded.player_name, position=excluded.position,
            category=excluded.category, college=excluded.college, age=excluded.age,
            hof=excluded.hof, allpro=excluded.allpro, probowls=excluded.probowls,
            seasons_started=excluded.seasons_started, career_av=excluded.career_av,
            draft_av=excluded.draft_av, games=excluded.games,
            pass_completions=excluded.pass_completions, pass_attempts=excluded.pass_attempts,
            pass_yards=excluded.pass_yards, pass_tds=excluded.pass_tds,
            pass_ints=excluded.pass_ints, rush_atts=excluded.rush_atts,
            rush_yards=excluded.rush_yards, rush_tds=excluded.rush_tds,
            receptions=excluded.receptions, rec_yards=excluded.rec_yards,
            rec_tds=excluded.rec_tds, def_solo_tackles=excluded.def_solo_tackles,
            def_ints=excluded.def_ints, def_sacks=excluded.def_sacks,
            updated_at=excluded.updated_at
    """, batch)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    # Default: last 6 draft classes (covers current prospects + recent comparisons)
    current_year = datetime.now().year
    years = list(range(current_year - 5, current_year + 1))

    if len(sys.argv) > 1 and sys.argv[1] == "--years":
        years = [int(y) for y in sys.argv[2:]]

    # Pass None to get ALL years if no filter needed
    year_set = set(years) if years else None

    print(f"Razzle college adapter -- syncing years: {years or 'ALL'}")
    conn = get_connection()
    try:
        initialize_tables(conn)

        combine_count = process_combine(conn, year_set)
        draft_count = process_draft_picks(conn, year_set)

        # Update sync state
        conn.execute("""
            INSERT OR REPLACE INTO sync_state (key, value, updated_at)
            VALUES ('last_college_sync', ?, ?)
        """, (json.dumps({"years": years, "combine": combine_count, "draft_picks": draft_count}), utc_now()))
        conn.commit()

        # Summary
        combine_total = conn.execute("SELECT COUNT(*) FROM combine_data").fetchone()[0]
        draft_total = conn.execute("SELECT COUNT(*) FROM draft_picks").fetchone()[0]
        print(f"\nDone. {combine_total} combine entries, {draft_total} draft picks in terminal.db")

        # Bust data cache so server sees fresh results
        try:
            from backend.live_data.core import cache_clear
            cache_clear()
        except Exception:
            pass
    finally:
        conn.close()


if __name__ == "__main__":
    main()
