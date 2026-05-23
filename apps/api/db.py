"""Razzle V2 database access.

Single SQLite connection-pool wrapper used by every router. Replaces the
home-rolled pool in legacy/backend/db.py with a smaller, more readable
version: just a thread-safe deque, the same PRAGMAs, the same context
manager API.

Why we kept SQLite: the data is small (~500MB), the read pattern is heavy
(every screener query), the write pattern is tiny (weekly adapter sync +
user preference writes). SQLite + WAL on a persistent disk is the right
tool. Postgres becomes interesting at ~10x scale.
"""

from __future__ import annotations

import logging
import sqlite3
import threading
from collections import deque
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from .config import get_settings

logger = logging.getLogger("razzle.db")

POOL_SIZE = 5
_pool: deque[sqlite3.Connection] = deque()
_pool_lock = threading.Lock()


def _make_conn(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(str(path), timeout=30, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=30000")
    conn.execute("PRAGMA cache_size=-8000")  # 8MB per connection
    conn.execute("PRAGMA mmap_size=67108864")  # 64MB shared
    return conn


@contextmanager
def get_db() -> Iterator[sqlite3.Connection]:
    """Get a read-mostly connection to terminal.db (the big one)."""
    settings = get_settings()
    with _pool_lock:
        try:
            conn = _pool.popleft()
            conn.execute("SELECT 1")
        except (IndexError, sqlite3.Error):
            conn = _make_conn(settings.terminal_db_path)
    try:
        yield conn
    finally:
        with _pool_lock:
            if len(_pool) < POOL_SIZE:
                try:
                    conn.rollback()
                    _pool.append(conn)
                    return
                except sqlite3.Error:
                    pass
        try:
            conn.close()
        except sqlite3.Error:
            pass


@contextmanager
def get_users_db() -> Iterator[sqlite3.Connection]:
    """Get a connection to users.db (auth + billing). Separate file so terminal.db
    can be wiped/rebuilt without touching user state."""
    settings = get_settings()
    conn = sqlite3.connect(str(settings.users_db_path), timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
    finally:
        conn.close()


def pool_stats() -> dict:
    with _pool_lock:
        return {"pool_size": POOL_SIZE, "idle": len(_pool)}
