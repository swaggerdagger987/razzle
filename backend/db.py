"""
Razzle database connection module.

Single source of truth for DB connections. Plain SQLite with a simple
connection pool to avoid creating/destroying connections on every request.
"""

import logging
import sqlite3
import threading
from collections import deque
from contextlib import contextmanager
from pathlib import Path

logger = logging.getLogger("razzle.db")

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"

# ── Connection Pool ──────────────────────────────────────────────────────
# Simple thread-safe pool. SQLite connections are cheap but opening/closing
# on every request adds ~1-5ms overhead and risks leaks. Pool keeps up to
# POOL_SIZE idle connections ready for reuse.

POOL_SIZE = 5
_pool: deque = deque()
_pool_lock = threading.Lock()



def _make_conn() -> sqlite3.Connection:
    """Create a fresh SQLite connection with standard settings."""
    conn = sqlite3.connect(str(DB_PATH), timeout=30, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=30000")
    conn.execute("PRAGMA read_uncommitted=true")  # Skip shared locks for reads in WAL mode
    conn.execute("PRAGMA cache_size=-8000")  # 8MB page cache per connection (was 64MB, too much at 50 conns)
    conn.execute("PRAGMA mmap_size=67108864")  # 64MB memory-mapped I/O (shared across connections)
    return conn


def _checkout() -> sqlite3.Connection:
    """Get a connection from the pool (or create one if pool is empty)."""
    with _pool_lock:
        if _pool:
            conn = _pool.popleft()
            # Verify the connection is still alive
            try:
                conn.execute("SELECT 1")
                return conn
            except Exception:
                # Connection went stale — discard and make a new one
                try:
                    conn.close()
                except Exception:
                    pass
    return _make_conn()


def _checkin(conn: sqlite3.Connection):
    """Return a connection to the pool (or close it if pool is full)."""
    with _pool_lock:
        if len(_pool) < POOL_SIZE:
            try:
                # Reset any uncommitted transaction state
                conn.rollback()
                _pool.append(conn)
                return
            except Exception:
                pass
    # Pool full or connection broken — just close it
    try:
        conn.close()
    except Exception:
        pass


def get_conn() -> sqlite3.Connection:
    """Get a database connection from the pool.

    For backward compatibility with code that manages connections manually.
    Prefer get_db() context manager for automatic cleanup.
    """
    return _checkout()


@contextmanager
def get_db():
    """Context manager for database connections. Returns to pool on exit."""
    conn = _checkout()
    try:
        yield conn
    finally:
        _checkin(conn)


def get_write_conn() -> sqlite3.Connection:
    """Get a writable connection (used by adapters for data ingestion).

    Returns a direct connection NOT from the pool, since adapter writes
    may be long-running and should not block the pool.
    """
    return _make_conn()


def pool_stats() -> dict:
    """Return pool statistics for health checks."""
    with _pool_lock:
        return {
            "pool_size": POOL_SIZE,
            "idle_connections": len(_pool),
        }
