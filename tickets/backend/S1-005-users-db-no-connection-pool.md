# S1-005: users.db opens new connection per request — no pooling

**Severity**: S1 (High)
**Category**: performance
**Source**: EDGE-CASES.md #34
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`backend/auth.py:72-88` — Every auth call creates a new SQLite connection, executes PRAGMA, then closes:

```python
# auth.py:72-78
def get_users_conn():
    USERS_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(USERS_DB_PATH), timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

# auth.py:80-88
@contextmanager
def get_users_db():
    conn = get_users_conn()
    try:
        yield conn
    finally:
        conn.close()
```

Under load (multiple concurrent login/register/auth-check requests), this causes:
- Connection churn overhead
- `database is locked` errors when connections compete
- PRAGMA executed redundantly on every request

## Fix

Use the same pooling pattern as `backend/db.py` (which has `pool=5, cache=8MB`). Create a small connection pool for users.db:

```python
import queue

_users_pool = queue.Queue(maxsize=5)

def get_users_conn():
    try:
        conn = _users_pool.get_nowait()
        conn.execute("SELECT 1")  # health check
        return conn
    except (queue.Empty, sqlite3.Error):
        conn = sqlite3.connect(str(USERS_DB_PATH), timeout=30)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA cache_size=-8192")  # 8MB
        return conn

def return_users_conn(conn):
    try:
        _users_pool.put_nowait(conn)
    except queue.Full:
        conn.close()
```

## Files to Change

- `backend/auth.py:72-88` — replace with connection pool

## Accept When

1. Connections are reused across requests (no PRAGMA on every call)
2. Pool size is capped (e.g., 5 connections)
3. No `database is locked` errors under concurrent auth requests
4. Health check on borrowed connections to handle stale connections

## Do NOT Touch

- `backend/db.py` — terminal.db already has proper pooling, don't modify
- Connection parameters (timeout=30, WAL mode) — keep those
