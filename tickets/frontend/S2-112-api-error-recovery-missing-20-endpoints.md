---
id: S2-112
severity: S2
confidence: HIGH
category: frontend
source: DQ-377+378+379+482+487
status: OPEN
---

# 20+ API endpoints return raw errors — no frontend error recovery

## Root Cause

Multiple backend endpoints lack error handling, returning raw Python tracebacks (500 errors) or inconsistent error shapes. Frontend callers of these endpoints have no `.catch()` or show no user-facing error message.

## Findings

1. **20+ player/trade/dynasty API endpoints no error handling** (DQ-377) — Backend functions in `live_data/` modules don't catch database errors. A corrupted row or missing column crashes the endpoint with a 500.

2. **`/api/roster-value` returns inconsistent error shape** (DQ-378) — Sometimes returns a Python `dict` with an "error" key, sometimes a `JSONResponse`. Frontend can't reliably detect errors.

3. **37 college API endpoints lack error handling** (DQ-379) — `live_data/college.py` functions don't catch `sqlite3.OperationalError` or handle missing tables. College panels crash silently on bad data.

4. **`prevPage`/`nextPage` pagination has no `.catch()`** (DQ-482) — Network failure during pagination shows no error. User sees empty table with no explanation.

5. **Sync `.catch()` blocks are empty — silent data loss** (DQ-487) — Watchlist, saved views, formulas, and agent memory cloud sync have `.catch(() => {})` — errors silently swallowed. User thinks data is saved when it isn't.

## Fix

1. Backend: Wrap `live_data/` query functions in try/except blocks that return `{"error": "description"}` with appropriate HTTP status codes
2. Frontend: Replace empty `.catch(() => {})` with `.catch(err => showToast("Sync failed: " + err.message))` or similar
3. Frontend: Add error handling to pagination fetch calls

## Files

- `backend/live_data/college.py` — 37 functions
- `backend/live_data/dynasty.py`, `players.py`, `analytics.py` — 20+ functions
- `frontend/lab.js` — pagination error handling
- `frontend/app.js`, `frontend/lab.js`, `frontend/warroom.js` — sync `.catch()` blocks

## Acceptance Criteria

1. No raw 500 tracebacks reach the frontend
2. Empty `.catch()` blocks replaced with user-visible error feedback
3. Pagination failure shows "couldn't load page — try again" message
4. Sync failures show toast notification
