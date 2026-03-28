---
id: S1-032
severity: S1
confidence: HIGH
category: billing
source: 2026-03-14-review.md (Formula Cloud Sync Has No Plan Check)
status: OPEN
---

# Formula cloud sync endpoints allow free users — missing require_plan("pro")

## Root Cause

`backend/server.py:1403-1469` — The user formula CRUD endpoints (`GET /api/user/formulas`, `POST /api/user/formulas`, `DELETE /api/user/formulas/{id}`) use `require_auth()` only. They do NOT use `require_plan("pro")`.

Any registered user (including free-tier) can sync formulas to the cloud. This contradicts the pricing page which lists "Formula cloud sync" as a Pro feature.

**Contrast with correctly gated endpoints:**
- `server.py` watchlist sync uses `require_plan("pro")`
- `server.py` saved views sync uses `require_plan("pro")`
- `server.py` formula PUBLISH uses `require_plan("pro")` at the `/api/formulas/publish` endpoint

The formula CRUD (personal sync) was missed.

## Fix

Add `require_plan("pro")` to all three user formula endpoints:

```python
@app.get("/api/user/formulas")
async def get_user_formulas(request: Request):
    user, err = require_plan(request, "pro")
    if err:
        return err
    # ...

@app.post("/api/user/formulas")
async def save_user_formula(request: Request):
    user, err = require_plan(request, "pro")
    if err:
        return err
    # ...

@app.delete("/api/user/formulas/{formula_id}")
async def delete_user_formula(formula_id: int, request: Request):
    user, err = require_plan(request, "pro")
    if err:
        return err
    # ...
```

## Files to Change

- `backend/server.py:1403-1469` — replace `require_auth()` with `require_plan(request, "pro")` on all 3 formula user endpoints

## Accept When

1. `GET /api/user/formulas` returns 403 for free-tier users
2. `POST /api/user/formulas` returns 403 for free-tier users
3. `DELETE /api/user/formulas/{id}` returns 403 for free-tier users
4. Pro and Elite users can still sync formulas normally
5. Frontend formula builder still works locally for free users (localStorage only)

## Do NOT Touch

- `/api/formulas/store` (public browsing — correctly unauthenticated)
- `/api/formulas/publish` (already has `require_plan("pro")`)
- Frontend formula builder logic — free users can still create formulas locally
