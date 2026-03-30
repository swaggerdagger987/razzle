---
severity: S0
confidence: HIGH
category: backend-reliability
source: go-live-audit-2026-03-29
audit_ref: "Finding 2: Missing-table exceptions are converted to HTTP 200 with empty payload"
---

# Missing-table SQLite errors silently return HTTP 200 with empty data

## What's Wrong

The global exception handler catches `sqlite3.OperationalError` with "no such table" and returns `{"items": [], "count": 0, "error": "data not available"}` with **status code 200**. This means:

- If a migration fails or an adapter hasn't run, the frontend shows "no data" instead of an error
- Monitoring/alerting won't fire because the response is 200
- Users see an empty Lab and think there's nothing there — silent data failure destroys trust
- Developers debugging production can't distinguish "table genuinely empty" from "table doesn't exist"

## Root Cause

**File**: `backend/server.py:817-821`

```python
# Missing tables (college adapter not run, etc.) → return empty data, not 500
if isinstance(exc, sqlite3.OperationalError) and "no such table" in str(exc):
    logger.warning("Missing table on %s %s: %s", request.method, request.url.path, exc)
    if request.url.path.startswith("/api/"):
        return JSONResponse({"items": [], "count": 0, "error": "data not available"}, status_code=200)
```

## The Fix

Change the status code to **503 Service Unavailable** with a `Retry-After` header. This signals to the frontend (and any monitoring) that data is temporarily unavailable, not that the query returned zero results.

**File**: `backend/server.py:821`

Change:
```python
return JSONResponse({"items": [], "count": 0, "error": "data not available"}, status_code=200)
```

To:
```python
return JSONResponse(
    {"items": [], "count": 0, "error": "data temporarily unavailable — sync in progress"},
    status_code=503,
    headers={"Retry-After": "30"},
)
```

Then in the frontend, catch 503 and show a "data is syncing, try again shortly" message instead of rendering an empty table.

## Acceptance Criteria

- [ ] Missing-table errors return HTTP 503, not 200
- [ ] Response includes `Retry-After` header
- [ ] Response body `error` field says "data temporarily unavailable" (not "data not available")
- [ ] Frontend handles 503 gracefully (shows retry message, not blank table)
- [ ] `python functional-qa/tests/smoke.py` passes
- [ ] Existing tables still return 200 with data normally

## Context

Go-live blocker. If bootstrap fails or is slow on deploy, every user hitting the site gets empty pages with no indication anything is wrong. This is the "half the product is broken" problem — silent failures are worse than loud ones.
