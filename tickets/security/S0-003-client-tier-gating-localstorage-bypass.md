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

## Fix

Add server-side enforcement for ALL plan-gated features. The client-side checks are fine for UI (hiding buttons, showing upgrade prompts), but the server must be the source of truth:

1. **Formula count**: `/api/user/formulas` POST — already enforces free=3 (server.py:1411-1433). Verify Pro has a limit too (currently unlimited).
2. **CSV export**: If CSV is generated client-side from existing API data, server can't gate it. Consider generating CSV server-side behind `require_plan()`.
3. **Compare slots**: Compare page fetches player data — add plan check to limit concurrent player requests.
4. **Season restrictions**: `/api/screener/query` should validate season parameter against plan.

For client-side, add a periodic `checkAuth()` call that re-validates the plan from `/api/auth/me` and overwrites localStorage if tampered.

## Files to Change

- `backend/server.py` — add plan checks to CSV export, compare, season-restricted endpoints
- `frontend/app.js:315-360` — add periodic server re-validation of plan (e.g., every 5 minutes)

## Accept When

1. `localStorage.setItem("razzle_user", JSON.stringify({plan:"elite"}))` does NOT unlock server-gated features
2. Server rejects API calls that exceed plan limits (formulas, seasons, etc.)
3. Client re-validates plan from server within 5 minutes, overwriting tampered localStorage

## Do NOT Touch

- Client-side UI gating (hiding buttons for free users) — this is fine for UX, just can't be the only gate
- Auth flow (login, register, JWT) — those work correctly
