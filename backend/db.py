"""
Razzle database connection module.

Single source of truth for DB connections. Uses Turso (libSQL) when
TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars are set; falls back
to local SQLite for local development.
"""

import os
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"

# Turso config from environment
_TURSO_URL = os.environ.get("TURSO_DATABASE_URL", "")
_TURSO_TOKEN = os.environ.get("TURSO_AUTH_TOKEN", "")

# Try to import libsql; fall back to sqlite3 if unavailable
_libsql = None
if _TURSO_URL and _TURSO_TOKEN:
    try:
        import libsql_experimental as _libsql
    except ImportError:
        _libsql = None


def _use_turso():
    """Return True if Turso credentials are available and libsql is installed."""
    return _libsql is not None and bool(_TURSO_URL) and bool(_TURSO_TOKEN)


def get_conn():
    """Get a database connection (Turso in production, local SQLite in dev)."""
    if _use_turso():
        conn = _libsql.connect(database=_TURSO_URL, auth_token=_TURSO_TOKEN)
        conn.row_factory = sqlite3.Row
        return conn
    conn = sqlite3.connect(str(DB_PATH), timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


def get_write_conn():
    """Get a writable connection (used by adapters for data ingestion).

    Same as get_conn() but explicit about write intent.
    """
    return get_conn()
