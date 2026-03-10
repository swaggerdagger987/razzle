"""
One-time migration script: push local terminal.db data to Turso.

Usage:
    # Set env vars first:
    #   TURSO_DATABASE_URL=libsql://razzle-swaggerdagger987.aws-us-east-2.turso.io
    #   TURSO_AUTH_TOKEN=<token>
    python scripts/push_to_turso.py

Reads every table + index from local data/terminal.db and recreates them
in Turso. Large tables are batched to avoid timeouts.
"""

import os
import sqlite3
import sys
from pathlib import Path

# Allow importing from project root
sys.path.insert(0, str(Path(__file__).parent.parent))

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"
BATCH_SIZE = 500  # rows per INSERT batch


def main():
    url = os.environ.get("TURSO_DATABASE_URL")
    token = os.environ.get("TURSO_AUTH_TOKEN")
    if not url or not token:
        print("ERROR: Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars")
        sys.exit(1)

    try:
        import libsql_experimental as libsql
    except ImportError:
        print("ERROR: pip install libsql-experimental")
        sys.exit(1)

    if not DB_PATH.exists():
        print(f"ERROR: Local database not found at {DB_PATH}")
        sys.exit(1)

    # Connect to local SQLite
    local = sqlite3.connect(str(DB_PATH))
    local.row_factory = sqlite3.Row

    # Connect to Turso
    remote = libsql.connect(database=url, auth_token=token)

    # Get all CREATE TABLE and CREATE INDEX statements
    schema_rows = local.execute(
        "SELECT type, name, sql FROM sqlite_master "
        "WHERE sql IS NOT NULL AND type IN ('table', 'index') "
        "ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END, name"
    ).fetchall()

    # Step 1: Create tables and indexes
    print("=== Creating schema ===")
    for row in schema_rows:
        obj_type, name, sql = row["type"], row["name"], row["sql"]
        # Use IF NOT EXISTS to be idempotent
        safe_sql = sql.replace("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ", 1)
        safe_sql = safe_sql.replace("CREATE INDEX ", "CREATE INDEX IF NOT EXISTS ", 1)
        print(f"  {obj_type}: {name}")
        try:
            remote.execute(safe_sql)
            remote.commit()
        except Exception as e:
            print(f"    WARNING: {e}")

    # Step 2: Get table list and push data
    tables = [r["name"] for r in schema_rows if r["type"] == "table"]

    print("\n=== Pushing data ===")
    for table in tables:
        count = local.execute(f"SELECT COUNT(*) FROM [{table}]").fetchone()[0]
        if count == 0:
            print(f"  {table}: 0 rows (skip)")
            continue

        # Get column names
        cursor = local.execute(f"SELECT * FROM [{table}] LIMIT 1")
        cols = [desc[0] for desc in cursor.description]
        placeholders = ", ".join(["?"] * len(cols))
        col_list = ", ".join([f"[{c}]" for c in cols])
        insert_sql = f"INSERT OR REPLACE INTO [{table}] ({col_list}) VALUES ({placeholders})"

        print(f"  {table}: {count} rows ...", end="", flush=True)

        # Batch insert
        offset = 0
        inserted = 0
        while offset < count:
            rows = local.execute(
                f"SELECT * FROM [{table}] LIMIT {BATCH_SIZE} OFFSET {offset}"
            ).fetchall()
            if not rows:
                break
            for row in rows:
                remote.execute(insert_sql, tuple(row))
            remote.commit()
            inserted += len(rows)
            offset += BATCH_SIZE
            # Progress indicator
            if count > BATCH_SIZE:
                pct = min(100, int(inserted / count * 100))
                print(f"\r  {table}: {inserted}/{count} ({pct}%)", end="", flush=True)

        print(f"\r  {table}: {inserted} rows OK" + " " * 20)

    local.close()
    print("\n=== Migration complete ===")


if __name__ == "__main__":
    main()
