"""
One-time migration script: push local terminal.db data to Turso.

Usage:
    # Set env vars first:
    #   TURSO_DATABASE_URL=libsql://razzle-swaggerdagger987.aws-us-east-2.turso.io
    #   TURSO_AUTH_TOKEN=<token>
    python scripts/push_to_turso.py

Uses Turso's HTTP pipeline API with transaction batching for throughput.
"""

import json
import os
import sqlite3
import sys
import urllib.request
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"
BATCH_SIZE = 1000  # rows per HTTP pipeline request


def turso_pipeline(base_url, token, statements):
    """Send a batch of statements via Turso's HTTP pipeline API."""
    url = f"{base_url}/v3/pipeline"
    requests_body = {
        "requests": [
            {"type": "execute", "stmt": s} for s in statements
        ] + [{"type": "close"}]
    }
    data = json.dumps(requests_body).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    resp = urllib.request.urlopen(req, timeout=120)
    result = json.loads(resp.read())
    for r in result.get("results", []):
        if r.get("type") == "error":
            return r["error"]
    return None


def make_stmt(sql, args=None):
    """Build a statement object for the pipeline API."""
    stmt = {"sql": sql}
    if args:
        stmt["args"] = [
            {"type": "null", "value": None} if v is None
            else {"type": "integer", "value": str(v)} if isinstance(v, int)
            else {"type": "float", "value": v} if isinstance(v, float)
            else {"type": "text", "value": str(v)}
            for v in args
        ]
    return stmt


def main():
    raw_url = os.environ.get("TURSO_DATABASE_URL", "")
    token = os.environ.get("TURSO_AUTH_TOKEN", "")
    if not raw_url or not token:
        print("ERROR: Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars")
        sys.exit(1)

    base_url = raw_url.replace("libsql://", "https://")

    if not DB_PATH.exists():
        print(f"ERROR: Local database not found at {DB_PATH}")
        sys.exit(1)

    local = sqlite3.connect(str(DB_PATH))
    local.row_factory = sqlite3.Row

    # Step 1: Create schema
    schema_rows = local.execute(
        "SELECT type, name, sql FROM sqlite_master "
        "WHERE sql IS NOT NULL AND type IN ('table', 'index') "
        "ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END, name"
    ).fetchall()

    print("=== Creating schema ===")
    schema_stmts = []
    for row in schema_rows:
        obj_type, name, sql = row["type"], row["name"], row["sql"]
        safe_sql = sql.replace("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ", 1)
        safe_sql = safe_sql.replace("CREATE INDEX ", "CREATE INDEX IF NOT EXISTS ", 1)
        print(f"  {obj_type}: {name}")
        schema_stmts.append(make_stmt(safe_sql))

    err = turso_pipeline(base_url, token, schema_stmts)
    if err:
        print(f"  Schema error: {err}")

    # Step 2: Push data table by table with transaction batching
    tables = [r["name"] for r in schema_rows if r["type"] == "table"]

    print("\n=== Pushing data ===")
    for table in tables:
        count = local.execute(f"SELECT COUNT(*) FROM [{table}]").fetchone()[0]
        if count == 0:
            print(f"  {table}: 0 rows (skip)")
            continue

        cursor = local.execute(f"SELECT * FROM [{table}] LIMIT 1")
        cols = [desc[0] for desc in cursor.description]
        col_list = ", ".join([f"[{c}]" for c in cols])
        placeholders = ", ".join(["?" for _ in cols])
        insert_sql = f"INSERT OR REPLACE INTO [{table}] ({col_list}) VALUES ({placeholders})"

        print(f"  {table}: {count} rows", end="", flush=True)

        offset = 0
        inserted = 0
        while offset < count:
            rows = local.execute(
                f"SELECT * FROM [{table}] LIMIT {BATCH_SIZE} OFFSET {offset}"
            ).fetchall()
            if not rows:
                break

            # Wrap batch in transaction for faster writes
            stmts = [make_stmt("BEGIN")]
            stmts.extend(make_stmt(insert_sql, list(row)) for row in rows)
            stmts.append(make_stmt("COMMIT"))

            err = turso_pipeline(base_url, token, stmts)
            if err:
                print(f"\n    ERROR at offset {offset}: {err}")

            inserted += len(rows)
            offset += BATCH_SIZE
            if count > BATCH_SIZE:
                pct = min(100, int(inserted / count * 100))
                print(f"\r  {table}: {inserted}/{count} ({pct}%)", end="", flush=True)

        print(f"\r  {table}: {inserted} rows OK" + " " * 20)

    local.close()
    print("\n=== Migration complete ===")


if __name__ == "__main__":
    main()
