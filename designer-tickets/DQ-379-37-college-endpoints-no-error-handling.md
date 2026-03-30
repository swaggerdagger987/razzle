---
id: DQ-379
title: 37 college API endpoints all lack error handling — college panels crash on bad data
priority: P1
category: UX / reliability
page: Lab screener (college panels), standalone college pages
status: open
cycle: 49
---

## Problem

All 37 college-related API endpoints in `server.py` (lines 1859-1995) have zero error handling. When the college database table is missing, empty, or the query fails, FastAPI returns a raw 500 error. The college panels in the Lab show nothing — just a blank panel with no error message.

This is especially bad because the college adapter (`cfbfastr_adapter.py`) fetches from external NCAA data sources that may be unavailable. Any network failure or data gap crashes the entire college panel.

## Evidence

```bash
grep -n "def " backend/server.py | grep -i college
# 37 endpoints, none with try/except
```

Endpoints include:
- `/api/college/stats` (line 1859)
- `/api/college/player-profile` (line 1886)
- `/api/college/prospects` (line 1905)
- `/api/college/draft-class` (line 1920)
- ... 33 more

## Fix

Add error handling to all college endpoints, similar to the pattern used in `/api/stat-leaders`:

```python
@app.get("/api/college/stats")
async def college_stats(request: Request, ...):
    try:
        return fetch_college_stats(...)
    except Exception as e:
        logger.exception("college stats error")
        return JSONResponse({"error": "college data unavailable"}, status_code=500)
```

Consider a decorator or middleware to avoid repeating this 37 times.

## Verification

Switch to NCAA mode in the Lab screener with the college database table dropped. Should see a friendly error message, not a blank panel or browser console errors.
