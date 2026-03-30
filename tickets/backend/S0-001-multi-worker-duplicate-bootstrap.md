---
severity: S0
confidence: HIGH
category: backend-reliability
source: go-live-audit-2026-03-29
audit_ref: "Finding 1: Multi-worker startup runs heavy bootstrap + reconciliation multiple times against SQLite"
---

# Multi-worker startup runs duplicate bootstrap and reconciliation against SQLite

## What's Wrong

`render.yaml:15` starts uvicorn with `--workers 2`. Each worker runs the `lifespan` function independently, which means:
- Two `_background_bootstrap()` threads fire simultaneously (heavy DB writes/sync)
- Two `_reconciliation_loop()` asyncio tasks run concurrently (billing reconciliation every 6 hours)

SQLite does not handle concurrent writes well. This causes lock contention, potential WAL corruption, inconsistent startup behavior, and load spikes on every deploy.

## Root Cause

**File**: `render.yaml:15` — `startCommand: uvicorn backend.server:app --host 0.0.0.0 --port $PORT --workers 2`
**File**: `backend/server.py:528` — `t = threading.Thread(target=_background_bootstrap, daemon=True)` inside `lifespan()`
**File**: `backend/server.py:531-541` — `_reconciliation_loop()` asyncio task created inside `lifespan()`
**File**: `backend/server.py:455-469` — `_background_bootstrap()` performs heavy DB writes (bootstrap_database, _ensure_season_stats_table, _populate_dynasty_snapshots)

Both workers call `lifespan()` on startup, so bootstrap and reconciliation run 2x. With SQLite, only one writer can hold the lock at a time, so the second thread blocks or errors.

## The Fix

Add a single-worker ownership guard. Only one worker should run bootstrap and reconciliation. Options (pick simplest):

**Option A (recommended):** Use a file lock or environment flag so only the first worker to acquire it runs the background tasks.

```python
import fcntl, tempfile

_bootstrap_lock_file = os.path.join(tempfile.gettempdir(), "razzle_bootstrap.lock")

def _try_acquire_bootstrap_lock():
    """Return lock file handle if we're the first worker, else None."""
    try:
        f = open(_bootstrap_lock_file, "w")
        fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
        return f
    except (OSError, IOError):
        return None
```

Then in `lifespan()`:
```python
lock = _try_acquire_bootstrap_lock()
if lock:
    t = threading.Thread(target=_background_bootstrap, daemon=True)
    t.start()
    asyncio.create_task(_reconciliation_loop())
```

**Option B (simpler):** Change `render.yaml:15` to `--workers 1`. SQLite doesn't benefit from multi-worker anyway since all DB reads serialize through the GIL + SQLite lock. A single worker with async is sufficient for the target scale (10k users per CLAUDE.md).

## Acceptance Criteria

- [ ] `_background_bootstrap()` runs exactly once across all workers on startup
- [ ] `_reconciliation_loop()` runs in exactly one worker
- [ ] No SQLite lock contention errors in startup logs
- [ ] `python functional-qa/tests/smoke.py` passes
- [ ] Health endpoint returns healthy after deploy

## Context

This is a go-live blocker. Every Render deploy currently double-bootstraps, causing unpredictable startup behavior. SQLite + 2 writers = data races.
