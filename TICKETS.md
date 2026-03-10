# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## Backend Cleanup: Split live_data.py into Modules
**Exit Criterion**: `live_data.py` is replaced by a `live_data/` package with logical submodules (e.g., `players.py`, `prospects.py`, `college.py`, `analytics.py`, `cache.py`, `storage.py`). All imports in `server.py` updated. No function lost, no endpoint broken. Each module under 3,000 lines.

## Backend Cleanup: Add Caching to Popular Endpoints
**Exit Criterion**: All frequently-hit read endpoints (dynasty rankings, trade values, tier lists, stat leaders, filter options, featured) use the existing TTL cache pattern. Cache TTL of 5 minutes for volatile data, 60 minutes for stable data. At least 30 endpoints cached. Cache invalidates correctly on universe/season change.

## Backend Cleanup: Fix Duplicate Routes + Shared Utils
**Exit Criterion**: Duplicate route definitions for `aging_curves` and `td_regression` in server.py are removed (keep one each). `normalize_name()` is extracted to a shared `utils.py` and imported by all 3 adapters instead of duplicated. Fix Turso push script to use `executemany()` for batch inserts instead of row-by-row.

## Backend Cleanup: Add Structured Logging
**Exit Criterion**: Replace bare `except Exception` blocks with proper logging using Python's `logging` module. Add request logging middleware (method, path, status, duration). Log all errors with stack traces. Structured JSON format for production. Console format for local dev. No silent failures anywhere in the backend.

