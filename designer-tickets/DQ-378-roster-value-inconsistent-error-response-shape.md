---
id: DQ-378
title: /api/roster-value returns inconsistent error shape — dict vs JSONResponse
priority: P2
category: UX / reliability
page: Lab screener (roster builder panel)
status: open
cycle: 49
---

## Problem

The `/api/roster-value` endpoint returns errors in two different shapes:

1. **Rate limit error** (server.py:2471): `JSONResponse({"error": "..."}, status_code=429)` — correct
2. **Validation error** (server.py:2475): `{"error": "..."}` — returns as 200 OK with error field

The frontend cannot reliably distinguish "error with status 200" from "success with data." If the frontend checks `response.ok`, the validation error appears successful. If it checks for an `error` field, it works — but this pattern is inconsistent with every other endpoint.

## Evidence

```python
# Line 2471 — rate limit (correct)
return JSONResponse({"error": "rate limited"}, status_code=429)

# Line 2475 — validation error (inconsistent)
return {"error": "Players list is required"}

# Line 2478 — success
return fetch_roster_value(data["players"], ...)
```

## Fix

Change line 2475 to return proper status code:
```python
return JSONResponse({"error": "Players list is required"}, status_code=400)
```

## Verification

POST to `/api/roster-value` with empty body. Should return 400, not 200.
