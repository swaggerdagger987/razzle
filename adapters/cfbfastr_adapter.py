"""
cfbfastR adapter — fetches play-level player stats CSVs from sportsdataverse
GitHub releases, aggregates into per-player per-season totals, writes to SQLite.

Data source:
  - sportsdataverse/cfbfastR-data: player_stats/csv/player_stats_YYYY.csv
  - Play-level data with player IDs for each action (completion, reception, rush, etc.)
  - Aggregated into season totals: passing, rushing, receiving stats

Usage:
    python adapters/cfbfastr_adapter.py [--seasons 2022 2023 2024 2025]
"""

import csv
import io
import json
import re
import sqlite3
import sys
import urllib.request
from contextlib import contextmanager
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"

CFBFASTR_BASE = "https://raw.githubusercontent.com/sportsdataverse/cfbfastR-data/main/player_stats/csv"


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


def valid_id(val):
    """Check if a player ID field is a valid (non-NA, non-empty) value."""
    if not val:
        return None
    v = val.strip()
    if v in ("", "NA", "NaN", "None", "null"):
        return None
    return v


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
        CREATE TABLE IF NOT EXISTS cfb_player_season_stats (
            player_id TEXT,
            player_name TEXT,
            team TEXT,
            conference TEXT,
            season INTEGER,
            position TEXT,
            games INTEGER DEFAULT 0,
            completions INTEGER DEFAULT 0,
            pass_attempts INTEGER DEFAULT 0,
            pass_yards INTEGER DEFAULT 0,
            pass_tds INTEGER DEFAULT 0,
            ints_thrown INTEGER DEFAULT 0,
            sacks_taken INTEGER DEFAULT 0,
            carries INTEGER DEFAULT 0,
            rush_yards INTEGER DEFAULT 0,
            rush_tds INTEGER DEFAULT 0,
            receptions INTEGER DEFAULT 0,
            targets INTEGER DEFAULT 0,
            rec_yards INTEGER DEFAULT 0,
            rec_tds INTEGER DEFAULT 0,
            fumbles INTEGER DEFAULT 0,
            total_tds INTEGER DEFAULT 0,
            total_yards INTEGER DEFAULT 0,
            source TEXT DEFAULT 'cfbfastr',
            updated_at TEXT,
            PRIMARY KEY (player_id, season)
        );

        CREATE INDEX IF NOT EXISTS idx_cfb_stats_name ON cfb_player_season_stats(player_name);
        CREATE INDEX IF NOT EXISTS idx_cfb_stats_team ON cfb_player_season_stats(team);
        CREATE INDEX IF NOT EXISTS idx_cfb_stats_conf ON cfb_player_season_stats(conference);
        CREATE INDEX IF NOT EXISTS idx_cfb_stats_season ON cfb_player_season_stats(season);
        CREATE INDEX IF NOT EXISTS idx_cfb_stats_pos ON cfb_player_season_stats(position);
    """)
    conn.commit()


# ---------------------------------------------------------------------------
# CSV fetching + aggregation
# ---------------------------------------------------------------------------

def fetch_season_csv(season):
    """Download play-level CSV for a season, return raw text."""
    url = f"{CFBFASTR_BASE}/player_stats_{season}.csv"
    print(f"  Downloading player_stats_{season}.csv...")
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "razzle-cfbfastr-adapter/1.0")

    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            raw = resp.read()
        return raw.decode("utf-8-sig")
    except Exception as e:
        print(f"  Error downloading {season}: {e}")
        return None


def aggregate_season(csv_text, season):
    """
    Aggregate play-level data into per-player season totals.

    Each CSV row is a single play. Player columns indicate who was involved:
    - completion_player_id/completion_player/completion_yds: passer on a completion
    - incompletion_player_id/incompletion_player: passer on an incomplete
    - reception_player_id/reception_player/reception_yds: receiver on a catch
    - target_player_id/target_player: intended receiver
    - rush_player_id/rush_player/rush_yds: ball carrier on a rush
    - touchdown_player_id/touchdown_player: scorer
    - interception_thrown_player_id: passer who threw a pick
    - sack_taken_player_id: QB who took a sack
    - fumble_player_id: player who fumbled
    """
    reader = csv.DictReader(io.StringIO(csv_text))

    # Key: player_id -> stats dict
    players = defaultdict(lambda: {
        "name": "",
        "team": "",
        "conference": "",
        "games": set(),
        "completions": 0,
        "pass_attempts": 0,  # completions + incompletions + sacks (as attempts proxy)
        "pass_yards": 0,
        "pass_tds": 0,
        "ints_thrown": 0,
        "sacks_taken": 0,
        "carries": 0,
        "rush_yards": 0,
        "rush_tds": 0,
        "receptions": 0,
        "targets": 0,
        "rec_yards": 0,
        "rec_tds": 0,
        "fumbles": 0,
        "total_tds": 0,
    })

    play_count = 0
    for row in reader:
        play_count += 1
        game_id = row.get("game_id", "")
        team = row.get("team", "").strip()
        conf = row.get("conference", "").strip()

        # Parse all player IDs for this play upfront
        td_id = valid_id(row.get("touchdown_player_id"))
        comp_id = valid_id(row.get("completion_player_id"))
        inc_id = valid_id(row.get("incompletion_player_id"))
        rec_id = valid_id(row.get("reception_player_id"))
        tgt_id = valid_id(row.get("target_player_id"))
        rush_id = valid_id(row.get("rush_player_id"))

        # --- Passing: completions ---
        if comp_id:
            p = players[comp_id]
            p["name"] = (row.get("completion_player") or "").strip()
            p["team"] = team
            p["conference"] = conf
            p["games"].add(game_id)
            p["completions"] += 1
            p["pass_attempts"] += 1
            comp_yds = safe_int(row.get("completion_yds"))
            if comp_yds is not None:
                p["pass_yards"] += comp_yds
            # Passing TD: credit QB only when the receiver scored on a pass play
            if td_id and rec_id and td_id == rec_id and not rush_id:
                p["pass_tds"] += 1
                p["total_tds"] += 1

        # --- Passing: incompletions ---
        if inc_id:
            p = players[inc_id]
            p["name"] = (row.get("incompletion_player") or "").strip()
            p["team"] = team
            p["conference"] = conf
            p["games"].add(game_id)
            p["pass_attempts"] += 1

        # --- Receiving: receptions ---
        if rec_id:
            p = players[rec_id]
            p["name"] = (row.get("reception_player") or "").strip()
            p["team"] = team
            p["conference"] = conf
            p["games"].add(game_id)
            p["receptions"] += 1
            # Each reception is also a target (target_player_id not on completions)
            p["targets"] += 1
            rec_yds = safe_int(row.get("reception_yds"))
            if rec_yds is not None:
                p["rec_yards"] += rec_yds
            # Receiving TD: credit receiver only when they scored AND it's a pass play
            # Guard against cfbfastR rows where rush_id is also populated (ambiguous)
            if td_id and td_id == rec_id and not rush_id:
                p["rec_tds"] += 1
                p["total_tds"] += 1

        # --- Receiving: targets on incompletions ---
        # target_player_id is only populated on incompletions (never on completions)
        if tgt_id:
            p = players[tgt_id]
            p["name"] = (row.get("target_player") or "").strip()
            p["team"] = team
            p["conference"] = conf
            p["games"].add(game_id)
            p["targets"] += 1

        # --- Rushing ---
        if rush_id:
            p = players[rush_id]
            p["name"] = (row.get("rush_player") or "").strip()
            p["team"] = team
            p["conference"] = conf
            p["games"].add(game_id)
            p["carries"] += 1
            rush_yds = safe_int(row.get("rush_yds"))
            if rush_yds is not None:
                p["rush_yards"] += rush_yds
            # Rushing TD
            if td_id and td_id == rush_id:
                p["rush_tds"] += 1
                p["total_tds"] += 1

        # --- Interceptions thrown ---
        int_thrown_id = valid_id(row.get("interception_thrown_player_id"))
        if int_thrown_id:
            p = players[int_thrown_id]
            if row.get("interception_thrown_player"):
                p["name"] = row["interception_thrown_player"].strip()
            p["team"] = team
            p["conference"] = conf
            p["games"].add(game_id)
            p["ints_thrown"] += 1

        # --- Sacks taken ---
        sack_taken_id = valid_id(row.get("sack_taken_player_id"))
        if sack_taken_id:
            p = players[sack_taken_id]
            if row.get("sack_taken_player"):
                p["name"] = row["sack_taken_player"].strip()
            p["team"] = team
            p["conference"] = conf
            p["games"].add(game_id)
            p["sacks_taken"] += 1

        # --- Fumbles ---
        fum_id = valid_id(row.get("fumble_player_id"))
        if fum_id:
            p = players[fum_id]
            if row.get("fumble_player"):
                p["name"] = row["fumble_player"].strip()
            p["team"] = team
            p["conference"] = conf
            p["games"].add(game_id)
            p["fumbles"] += 1

    print(f"    Processed {play_count} plays, found {len(players)} unique players.")

    # Infer position based on stats
    results = []
    for pid, stats in players.items():
        if not stats["name"]:
            continue

        # Infer position from production
        pos = infer_position(stats)

        # Only keep offensive skill players with meaningful production
        total_yards = stats["pass_yards"] + stats["rush_yards"] + stats["rec_yards"]
        total_touches = stats["pass_attempts"] + stats["carries"] + stats["receptions"]
        if total_touches < 5:
            continue

        # pass_tds already counted in total_tds during play-level loop (line 224)

        results.append({
            "player_id": pid,
            "player_name": stats["name"],
            "team": stats["team"],
            "conference": stats["conference"],
            "season": season,
            "position": pos,
            "games": len(stats["games"]),
            "completions": stats["completions"],
            "pass_attempts": stats["pass_attempts"],
            "pass_yards": stats["pass_yards"],
            "pass_tds": stats["pass_tds"],
            "ints_thrown": stats["ints_thrown"],
            "sacks_taken": stats["sacks_taken"],
            "carries": stats["carries"],
            "rush_yards": stats["rush_yards"],
            "rush_tds": stats["rush_tds"],
            "receptions": stats["receptions"],
            "targets": stats["targets"],
            "rec_yards": stats["rec_yards"],
            "rec_tds": stats["rec_tds"],
            "fumbles": stats["fumbles"],
            "total_tds": stats["total_tds"],
            "total_yards": total_yards,
        })

    print(f"    Kept {len(results)} offensive players with >= 5 touches.")
    return results


def infer_position(stats):
    """Infer position from production profile."""
    pa = stats["pass_attempts"]
    car = stats["carries"]
    rec = stats["receptions"]
    tgt = stats["targets"]

    # QB: significant pass attempts
    if pa >= 20:
        return "QB"

    # WR/TE: primarily receiving
    if tgt >= 10 and tgt > car:
        return "WR"  # Can't distinguish WR/TE from stats alone

    # RB: primarily rushing
    if car >= 10:
        return "RB"

    # Fallback based on whatever is dominant
    if pa > car and pa > tgt:
        return "QB"
    if tgt > car:
        return "WR"
    if car > 0:
        return "RB"

    return "ATH"


# ---------------------------------------------------------------------------
# Database writes
# ---------------------------------------------------------------------------

def upsert_stats(conn, results):
    """Write aggregated stats to cfb_player_season_stats."""
    now = utc_now()
    batch = []
    for r in results:
        batch.append((
            r["player_id"], r["player_name"], r["team"], r["conference"],
            r["season"], r["position"], r["games"],
            r["completions"], r["pass_attempts"], r["pass_yards"],
            r["pass_tds"], r["ints_thrown"], r["sacks_taken"],
            r["carries"], r["rush_yards"], r["rush_tds"],
            r["receptions"], r["targets"], r["rec_yards"], r["rec_tds"],
            r["fumbles"], r["total_tds"], r["total_yards"],
            "cfbfastr", now,
        ))

        if len(batch) >= 500:
            _insert_batch(conn, batch)
            batch = []

    if batch:
        _insert_batch(conn, batch)
    conn.commit()


def _insert_batch(conn, batch):
    conn.executemany("""
        INSERT INTO cfb_player_season_stats (
            player_id, player_name, team, conference,
            season, position, games,
            completions, pass_attempts, pass_yards,
            pass_tds, ints_thrown, sacks_taken,
            carries, rush_yards, rush_tds,
            receptions, targets, rec_yards, rec_tds,
            fumbles, total_tds, total_yards,
            source, updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(player_id, season)
        DO UPDATE SET
            player_name=excluded.player_name, team=excluded.team,
            conference=excluded.conference, position=excluded.position,
            games=excluded.games, completions=excluded.completions,
            pass_attempts=excluded.pass_attempts, pass_yards=excluded.pass_yards,
            pass_tds=excluded.pass_tds, ints_thrown=excluded.ints_thrown,
            sacks_taken=excluded.sacks_taken, carries=excluded.carries,
            rush_yards=excluded.rush_yards, rush_tds=excluded.rush_tds,
            receptions=excluded.receptions, targets=excluded.targets,
            rec_yards=excluded.rec_yards, rec_tds=excluded.rec_tds,
            fumbles=excluded.fumbles, total_tds=excluded.total_tds,
            total_yards=excluded.total_yards, updated_at=excluded.updated_at
    """, batch)


# ---------------------------------------------------------------------------
# Combine data sync
# ---------------------------------------------------------------------------

COMBINE_URL = "https://github.com/nflverse/nflverse-data/releases/download/combine/combine.csv"


def sync_combine_data(conn):
    """Fetch nflverse combine data and write to combine_data table.

    Uses existing schema: cfb_id, pfr_id, player_name, position, school,
    draft_year, draft_team, draft_round, draft_pick, height_inches, weight,
    forty, bench, vertical, broad_jump, cone, shuttle, source, updated_at
    """
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
            height_inches REAL,
            weight INTEGER,
            forty REAL,
            bench INTEGER,
            vertical REAL,
            broad_jump INTEGER,
            cone REAL,
            shuttle REAL,
            source TEXT DEFAULT 'nflverse',
            updated_at TEXT,
            PRIMARY KEY (draft_year, player_name, school)
        );
        CREATE INDEX IF NOT EXISTS idx_combine_year ON combine_data(draft_year);
        CREATE INDEX IF NOT EXISTS idx_combine_pos ON combine_data(position);
    """)

    print("  Fetching combine data...")
    req = urllib.request.Request(COMBINE_URL)
    req.add_header("User-Agent", "razzle-cfbfastr-adapter/1.0")

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read()
        text = raw.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text))
        rows = list(reader)
    except Exception as e:
        print(f"  Combine fetch failed: {e}")
        return

    def parse_height_inches(ht_str):
        """Convert height string like '6-2' or '74' to inches."""
        if not ht_str or ht_str.strip() in ("", "NA"):
            return None
        ht = ht_str.strip()
        if "-" in ht:
            parts = ht.split("-")
            try:
                return int(parts[0]) * 12 + int(parts[1])
            except (ValueError, IndexError):
                return None
        return safe_float(ht)

    now = utc_now()
    batch = []
    for row in rows:
        draft_year = safe_int(row.get("draft_year") or row.get("season"))
        if draft_year is None:
            continue
        batch.append((
            (row.get("cfb_id") or "").strip(),
            (row.get("pfr_id") or "").strip(),
            (row.get("player_name") or "").strip(),
            (row.get("pos") or "").strip().upper(),
            (row.get("school") or "").strip(),
            draft_year,
            (row.get("draft_team") or "").strip(),
            safe_int(row.get("draft_round")),
            safe_int(row.get("draft_ovr")),
            parse_height_inches(row.get("ht")),
            safe_int(row.get("wt")),
            safe_float(row.get("forty")),
            safe_int(row.get("bench")),
            safe_float(row.get("vertical")),
            safe_int(row.get("broad_jump")),
            safe_float(row.get("cone")),
            safe_float(row.get("shuttle")),
            "nflverse",
            now,
        ))

    if batch:
        conn.executemany("""
            INSERT OR REPLACE INTO combine_data (
                cfb_id, pfr_id, player_name, position, school,
                draft_year, draft_team, draft_round, draft_pick,
                height_inches, weight, forty, bench, vertical,
                broad_jump, cone, shuttle, source, updated_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, batch)
        conn.commit()

    total = conn.execute("SELECT COUNT(*) FROM combine_data").fetchone()[0]
    current_year = datetime.now().year
    recent = conn.execute("SELECT COUNT(*) FROM combine_data WHERE draft_year >= ?", (current_year - 1,)).fetchone()[0]
    print(f"  Combine data: {total} total rows, {recent} for {current_year - 1}+ draft classes.")


# ---------------------------------------------------------------------------
# Position refinement via combine/draft data
# ---------------------------------------------------------------------------

def refine_positions_from_combine(conn):
    """
    Update inferred positions using combine_data and draft_picks tables
    which have accurate position data from NFL scouting.
    """
    # Match by normalized name + team/school
    updated = 0

    # Get all cfb players
    cfb_rows = conn.execute("""
        SELECT DISTINCT player_id, player_name, team FROM cfb_player_season_stats
    """).fetchall()

    # Build lookup from combine_data and draft_picks
    combine_rows = conn.execute("""
        SELECT player_name, position, school FROM combine_data
        WHERE position IN ('QB', 'RB', 'WR', 'TE', 'FB')
    """).fetchall()

    draft_rows = conn.execute("""
        SELECT player_name, position, college FROM draft_picks
        WHERE position IN ('QB', 'RB', 'WR', 'TE', 'FB')
    """).fetchall()

    # Build name -> position lookup (combine takes priority, then draft)
    name_pos = {}
    for row in draft_rows:
        key = normalize_name(row["player_name"])
        if key:
            name_pos[key] = row["position"]
    for row in combine_rows:
        key = normalize_name(row["player_name"])
        if key:
            name_pos[key] = row["position"]

    for row in cfb_rows:
        key = normalize_name(row["player_name"])
        if key in name_pos:
            new_pos = name_pos[key]
            conn.execute("""
                UPDATE cfb_player_season_stats
                SET position = ?
                WHERE player_id = ? AND position != ?
            """, (new_pos, row["player_id"], new_pos))
            updated += 1

    conn.commit()
    if updated > 0:
        print(f"  Refined {updated} player positions from combine/draft data.")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    current_year = datetime.now().year
    # Default: 2015-current (expanded for deeper historical analysis)
    seasons = list(range(2015, current_year + 1))

    if len(sys.argv) > 1 and sys.argv[1] == "--seasons":
        seasons = [int(y) for y in sys.argv[2:]]

    print(f"Razzle cfbfastR adapter -- syncing seasons: {seasons}")
    conn = get_connection()
    try:
        initialize_tables(conn)

        total_players = 0
        for season in seasons:
            csv_text = fetch_season_csv(season)
            if csv_text is None:
                print(f"  Skipping {season} (download failed).")
                continue

            results = aggregate_season(csv_text, season)
            upsert_stats(conn, results)
            total_players += len(results)
            print(f"  {season}: {len(results)} players written.")

        # Sync combine data (includes 2026 draft class)
        try:
            sync_combine_data(conn)
        except Exception as e:
            print(f"  Combine sync skipped: {e}")

        # Refine positions using combine/draft data if available
        try:
            refine_positions_from_combine(conn)
        except Exception as e:
            print(f"  Position refinement skipped: {e}")

        # Update sync state
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sync_state (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TEXT
            )
        """)
        conn.execute("""
            INSERT OR REPLACE INTO sync_state (key, value, updated_at)
            VALUES ('last_cfbfastr_sync', ?, ?)
        """, (json.dumps({"seasons": seasons, "total_players": total_players}), utc_now()))
        conn.commit()

        # Summary
        total = conn.execute("SELECT COUNT(*) FROM cfb_player_season_stats").fetchone()[0]
        seasons_in_db = conn.execute("SELECT DISTINCT season FROM cfb_player_season_stats ORDER BY season").fetchall()
        season_list = [r[0] for r in seasons_in_db]
        pos_counts = conn.execute("""
            SELECT position, COUNT(DISTINCT player_id) FROM cfb_player_season_stats
            GROUP BY position ORDER BY COUNT(DISTINCT player_id) DESC
        """).fetchall()

        print(f"\nDone. {total} player-season rows in cfb_player_season_stats.")
        print(f"Seasons: {season_list}")
        print("Position breakdown:")
        for row in pos_counts:
            print(f"  {row[0]}: {row[1]} unique players")

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
