---
severity: S2
confidence: HIGH
category: refactor
source: bloat-audit-2026-03-29
---

# R2: Extract error handler decorator for server.py endpoints

## What's Wrong

~140 endpoints in server.py wrap their logic in identical try/except blocks:

```python
@app.get("/api/something")
def something(season: int = 0, position: str = ""):
    try:
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_something(season=s, position=pos)
    except Exception as e:
        logger.exception("something error")
        return JSONResponse({"error": "Failed to fetch something"}, status_code=500)
```

That's 6 lines of boilerplate wrapping 2 lines of logic. The global exception handler at line 812 already catches unhandled exceptions, so these per-endpoint try/except blocks are redundant.

## The Fix

**Option A (simplest — recommended):** Remove the per-endpoint try/except blocks entirely. The global exception handler (`global_exception_handler` at line 812) already:
- Catches all unhandled exceptions
- Returns JSONResponse with status 500 for API routes
- Logs the full traceback

The per-endpoint catches add nothing except a slightly more specific error message ("Failed to fetch trade values" vs "Internal server error"). That specificity is not worth 6 lines x 140 endpoints = 840 lines.

**Transformation for simple GET endpoints:**

BEFORE (9 lines):
```python
@app.get("/api/trade-value-chart")
def trade_value_chart(season: int = 0, position: str = "", limit: int = 150):
    """Return all fantasy-relevant players ranked by dynasty trade value."""
    try:
        limit = max(1, min(300, limit))
        s = season if season > 0 else None
        pos = position.upper() if position else None
        return live_data.fetch_trade_value_chart(season=s, position=pos, limit=limit)
    except Exception as e:
        logger.exception("trade-value-chart error")
        return JSONResponse({"error": "Failed to fetch trade value chart"}, status_code=500)
```

AFTER (5 lines):
```python
@app.get("/api/trade-value-chart")
def trade_value_chart(season: int = 0, position: str = "", limit: int = 150):
    """Return all fantasy-relevant players ranked by dynasty trade value."""
    limit = max(1, min(300, limit))
    s = season if season > 0 else None
    pos = position.upper() if position else None
    return live_data.fetch_trade_value_chart(season=s, position=pos, limit=limit)
```

**DO NOT touch endpoints that have specific error handling logic** — e.g., POST endpoints that parse request bodies, auth endpoints that catch specific exceptions. Only remove try/except blocks where the catch clause is purely `logger.exception() + generic JSONResponse`.

## File to Modify

`backend/server.py` — Remove redundant try/except blocks from GET endpoints first, then simple POST endpoints.

**Work in batches of ~20 endpoints at a time. Run tests after each batch. Commit each batch.**

## Acceptance Criteria

- [ ] All simple GET endpoint try/except wrappers removed (where catch is just logger + generic 500)
- [ ] Simple POST endpoint wrappers removed (where catch is just logger + generic 500)
- [ ] Auth/billing endpoints with specific error handling are UNTOUCHED
- [ ] Global exception handler still present and working
- [ ] `PYTHONPATH=. python -m pytest tests/ -q` passes after each batch
- [ ] Line count of server.py decreases by 300+ lines

## Estimated Savings

~100 simple endpoints x 3 lines (try + except + return) = **~300 lines eliminated**
