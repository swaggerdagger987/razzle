# S2-012: Trial expiry is a silent demotion — no modal, no conversion prompt

**Severity**: S2 (Medium)
**Category**: ux-flow
**Source**: EDGE-CASES.md #38
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/app.js:784-794` — When a user's 7-day trial expires, their plan silently reverts from Pro to Free on the next `checkAuth()` call (page load only). No expiry modal, no conversion prompt, no toast.

The user just loses features with zero explanation. If their tab was open during expiry, they keep Pro UI until refresh. After refresh, features silently disappear.

## Fix

1. On `checkAuth()`, detect when `trial_active` transitions from true to false
2. Show a modal: "Your 7-day trial has ended. You explored X features. Keep them with Pro ($5/mo)."
3. Include a CTA to pricing page and a dismiss button
4. Optionally, show a toast 24h before expiry: "Trial ends tomorrow"

## Files to Change

- `frontend/app.js:784-794` — detect trial→expired transition, show modal
- `frontend/app.js` — add trial expiry modal HTML + JS

## Accept When

1. Trial expires → user sees a branded modal explaining what happened
2. Modal includes CTA to pricing and a dismiss option
3. After dismiss, user is on free tier (no confusion)
4. Optional: 24h warning toast before expiry

## Do NOT Touch

- Server-side trial logic — that's correct (trial_end comparison)
- `checkAuth()` timing — runs on page load, that's fine
