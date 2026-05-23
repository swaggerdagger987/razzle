#!/usr/bin/env python3
"""Populate data/terminal.db — lean by default.

Usage:
    python scripts/sync_data.py --quick      # dev: 2024-25, ~15MB (lean)
    python scripts/sync_data.py --full       # all seasons + metrics EAV (~1GB)
    python scripts/sync_data.py --slim       # drop metrics bloat from existing db
    python scripts/sync_data.py --status
"""

from __future__ import annotations

import argparse
import sqlite3
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
LEGACY = REPO / "legacy"
DB = REPO / "data" / "terminal.db"


def _run(cmd: list[str]) -> None:
    subprocess.run(cmd, cwd=LEGACY, check=True)


def _table_bytes(conn: sqlite3.Connection, table: str) -> int:
    row = conn.execute(
        "SELECT SUM(pgsize) FROM dbstat WHERE name=?", (table,)
    ).fetchone()
    return row[0] or 0


def status() -> None:
    if not DB.exists():
        print(f"  missing: {DB}")
        return
    conn = sqlite3.connect(DB)
    mb = DB.stat().st_size / 1_048_576
    players = conn.execute("SELECT COUNT(*) FROM players").fetchone()[0]
    weeks = conn.execute("SELECT COUNT(*) FROM player_week_stats").fetchone()[0]
    metrics_mb = _table_bytes(conn, "player_week_metrics") / 1_048_576
    conn.close()
    print(f"  path: {DB}")
    print(f"  size: {mb:.1f} MB")
    print(f"  players: {players:,}  week_rows: {weeks:,}")
    if metrics_mb > 1:
        print(f"  ⚠ player_week_metrics: {metrics_mb:.0f} MB — run --slim or re-sync with --quick")


def slim() -> None:
    if not DB.exists():
        print("No database to slim.")
        return
    before = DB.stat().st_size / 1_048_576
    conn = sqlite3.connect(DB)
    conn.execute("DROP TABLE IF EXISTS player_week_metrics")
    conn.execute("DROP INDEX IF EXISTS idx_pwm_key_val")
    conn.execute("DROP INDEX IF EXISTS idx_pwm_player")
    conn.execute("DROP INDEX IF EXISTS idx_pwm_player_key")
    conn.execute("DROP INDEX IF EXISTS idx_pwm_season_player")
    conn.commit()
    conn.close()
    conn = sqlite3.connect(DB)
    conn.execute("VACUUM")
    conn.close()
    after = DB.stat().st_size / 1_048_576
    print(f"Slimmed: {before:.1f} MB → {after:.1f} MB")


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--quick", action="store_true", help="2024-25 only, lean (~15MB)")
    p.add_argument("--full", action="store_true", help="All seasons + metrics EAV (large)")
    p.add_argument("--slim", action="store_true", help="Drop metrics table + VACUUM")
    p.add_argument("--status", action="store_true")
    p.add_argument("--nfl-only", action="store_true")
    args = p.parse_args()

    DB.parent.mkdir(parents=True, exist_ok=True)

    if args.status:
        status()
        return 0
    if args.slim:
        slim()
        status()
        return 0

    lean = not args.full  # default lean unless --full
    py = sys.executable
    nfl = [py, "adapters/nflverse_adapter.py"]
    if lean:
        nfl.append("--lean")
    if args.quick or lean and not args.full:
        nfl += ["--seasons", "2024", "2025"]
    elif not args.full:
        pass  # nflverse defaults to 2015-current

    print("NFL (nflverse)" + (" [lean]" if lean else " [full]"))
    _run(nfl)

    if not args.nfl_only:
        college = [py, "adapters/college_adapter.py"]
        cfb = [py, "adapters/cfbfastr_adapter.py"]
        if args.quick:
            college += ["--years", "2024", "2025", "2026"]
            cfb += ["--seasons", "2024", "2025"]
        print("Prospects")
        _run(college)
        print("College")
        _run(cfb)

    status()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
