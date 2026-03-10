"""
Razzle database connection module.

Single source of truth for DB connections. Plain SQLite — the database
file is downloaded during build on Render, or used locally from data/.
"""

import logging
import sqlite3
from contextlib import contextmanager
from pathlib import Path

logger = logging.getLogger("razzle.db")

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"


def get_conn():
    """Get a database connection."""
    conn = sqlite3.connect(str(DB_PATH), timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    """Context manager for database connections. Always closes on exit."""
    conn = get_conn()
    try:
        yield conn
    finally:
        conn.close()


def get_write_conn():
    """Get a writable connection (used by adapters for data ingestion)."""
    return get_conn()
