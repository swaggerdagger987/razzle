---
id: DQ-377
title: 20+ player/trade/dynasty API endpoints have no error handling — users see raw 500
priority: P1
category: UX / reliability
page: sitewide (any page using these endpoints)
status: open
cycle: 49
---

## Problem

20+ API endpoints in `server.py` have no try/except wrapper. When the database query fails (corrupt data, missing table, connection timeout), FastAPI returns a raw 500 error with a stack trace. The frontend shows nothing useful.

### Affected endpoints (no error handling)

**Player endpoints** (server.py:1743-1766):
- `/api/players/{id}/profile` (line 1745)
- `/api/players/{id}/weeks` (line 1751)
- `/api/players/{id}/seasons` (line 1756)
- `/api/players/{id}/comps` (line 1761)
- `/api/players/{id}/boom-bust` (line 1766)
- `/api/players/compare` (line 1772)

**Trade/Dynasty endpoints** (server.py:2446-2502):
- `/api/trade/values` (line 2451)
- `/api/trade/pick-values` (line 2463)
- `/api/dynasty-rankings` (line 2490)
- `/api/dynasty-history` (line 2501)
- `/api/team-roster` (line 2527)

**Contrast**: `/api/stat-leaders` (line 2511-2515) and `/api/trade-finder` (line 2814-2819) DO have proper error handling.

## Fix

Add standard error handling to each endpoint:
```python
@app.get("/api/players/{player_id}/profile")
async def player_profile(player_id: str, request: Request):
    try:
        return fetch_player_profile(player_id)
    except Exception as e:
        logger.exception("player profile error")
        return JSONResponse({"error": "something went wrong pulling that player"}, status_code=500)
```

## Verification

For each fixed endpoint: kill the DB connection, hit the endpoint, confirm you get a JSON error response (not an HTML stack trace).
