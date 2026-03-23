# DES-227: Auth modal has no "Forgot Password" flow

**Priority:** P0 — conversion blocker
**Page:** All (auth modal via app.js)
**Cycle:** 22

## Problem

The auth modal (app.js:840-860) has Sign In + Register tabs but zero password recovery. Users who forget their password are permanently locked out.

The conversion funnel requires registration -> trial -> paid. A locked-out user = lost revenue. This is the most fundamental auth UX gap.

## Evidence

- `app.js:847-851` — login form: email + password + error div + submit button. No "Forgot password?" link.
- `grep -r "forgot\|reset.password" frontend/` returns zero results.
- No `/api/auth/reset-password` endpoint exists in the backend.

## Fix

1. Add a "Forgot password?" link below the login form (between error div and submit button).
2. Create a password reset flow: email input -> send reset link -> backend generates token -> email with reset link -> new password form.
3. Style the link as `font-family:var(--font-mono); font-size:12px; color:var(--ink-light);` — understated but findable.
4. Backend: add `/api/auth/request-reset` and `/api/auth/reset-password` endpoints.

## Why this matters

Every SaaS product has password reset. Its absence signals "this is a side project, not a real product." Reddit power users (primary audience) will notice and mention it. One locked-out user who tweets "I can't even reset my password on razzle.lol" kills credibility.
