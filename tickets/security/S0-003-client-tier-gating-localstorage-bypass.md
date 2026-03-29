# S0-003: Client-side tier gating trivially bypassed via localStorage

**Severity**: S0 (Critical)
**Category**: security
**Source**: EDGE-CASES.md #3
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/app.js:315-360` — All tier checks read from `localStorage.getItem("razzle_user")` and trust the `plan` field without server verification.

```javascript
// app.js:315-320
function getUserPlan() {
  try {
    var u = JSON.parse(localStorage.getItem("razzle_user") || "null");
    return (u && u.plan) ? u.plan : "free";
  } catch (e) { return "free"; }
}

// app.js:323-326
function isPaidUser() {
  var p = getUserPlan();
  return p === "pro" || p === "elite" || p === "pro_lifetime" || p === "elite_lifetime";
}
```

An attacker can run:
```javascript
localStorage.setItem("razzle_user", JSON.stringify({plan:"elite"}));
```

This unlocks ALL client-gated features:
- `checkFeatureGate()` (app.js:340-360): unlimited formulas, filters, compare slots
- CSV export, all seasons, no ads, full pressure map
- `isProUser()` / `isEliteUser()` in warroom.js:2005-2019

The existing `require_plan()` server-side check only covers API endpoints. Features gated purely in JS have zero server enforcement.

## Endpoint Audit (UPDATED 2026-03-29)

### Endpoints WITH server-side plan enforcement (PROTECTED):
| Endpoint | Location | Gate |
|----------|----------|------|
| GET `/api/user/views` | server.py:1622-1627 | `require_plan("pro")` |
| POST `/api/user/views/sync` | server.py:1630-1639 | `require_plan("pro")` |
| GET `/api/user/watchlist` | server.py:1646-1651 | `require_plan("pro")` |
| POST `/api/user/watchlist/sync` | server.py:1654-1663 | `require_plan("pro")` |
| POST `/api/formulas/publish` | server.py:2052-2064 | `require_plan("pro")` |

### Endpoints WITHOUT server-side plan enforcement (UNPROTECTED):
| Endpoint | Location | Issue |
|----------|----------|-------|
| POST `/api/screener/query` | server.py:1695-1709 | No tier check — season params not validated |
| POST `/api/screener/sparklines` | server.py:1712-1720 | No tier check |
| GET `/api/players/compare` | server.py:1773-1776 | Free limited to 2 slots client-side only |

### Duplicate client-side gating (also vulnerable):
- `frontend/warroom.js:2005-2010` — `isProUser()` reads same localStorage
- `frontend/warroom.js:2013-2018` — `isEliteUser()` reads same localStorage
- `frontend/lab.js:42` — CSV export gating via `isPaidUser()`
- `frontend/lab.js:4505` — Cloud sync gating via `isPaidUser()`
- `frontend/app.js:1740` — Ad hiding via `isPaidUser()`

## Fix

Add server-side enforcement for ALL plan-gated features. The client-side checks are fine for UI (hiding buttons, showing upgrade prompts), but the server must be the source of truth:

1. **Screener query**: `server.py:1695-1709` — add `require_plan()` check for season restrictions
2. **Compare slots**: `server.py:1773-1776` — add plan check to limit concurrent player IDs
3. **CSV export**: Generated client-side from existing API data — consider server-side CSV behind `require_plan()`
4. **Formula count**: `server.py:1411-1433` — already enforces free=3 (verify Pro unlimited is intentional)

For client-side, add a periodic `checkAuth()` call that re-validates the plan from `/api/auth/me` and overwrites localStorage if tampered.

## Files to Change

- `backend/server.py:1695-1709` — add plan check to screener query
- `backend/server.py:1712-1720` — add plan check to sparklines
- `backend/server.py:1773-1776` — add plan check to compare endpoint
- `frontend/app.js:315-360` — add periodic server re-validation of plan (e.g., every 5 minutes)

## Accept When

1. `localStorage.setItem("razzle_user", JSON.stringify({plan:"elite"}))` does NOT unlock server-gated features
2. Server rejects API calls that exceed plan limits (formulas, seasons, etc.)
3. Client re-validates plan from server within 5 minutes, overwriting tampered localStorage

## Do NOT Touch

- Client-side UI gating (hiding buttons for free users) — this is fine for UX, just can't be the only gate
- Auth flow (login, register, JWT) — those work correctly
