---
id: S3-093
severity: S3
confidence: MEDIUM
category: performance
source: docs/reviews/2026-03-14-evidence-collector.md #9
status: OPEN
---

# 28 console.log/error statements in production JS files

## Root Cause

28 `console.log`, `console.error`, or `console.warn` statements remain in production JavaScript files:

- `frontend/lab.js` — 12 statements (error logging on fetch failures)
- `frontend/app.js` — 5 statements (ASCII tiger art easter egg + error handling)
- `frontend/formula-store.js` — 5 statements
- `frontend/charts.js` — 4 statements
- `frontend/formulas.js` — 2 statements

## Impact

- Minor: Users who open DevTools see internal error details
- The `app.js` ASCII tiger statements are an intentional brand easter egg (`console.log` of tiger art + `razzle.help()`)
- The `lab.js` and `charts.js` error statements log fetch failures — useful for debugging but expose internal API paths

## Fix

1. **Keep**: `app.js` ASCII tiger art (intentional brand touch)
2. **Remove or replace**: Error-logging `console.error` calls in `lab.js`, `charts.js`, `formula-store.js`, `formulas.js` with silent error handling or razzle-branded error toasts
3. Alternatively, wrap all console calls in a `DEBUG` flag check

## Files

- `frontend/lab.js` — 12 instances
- `frontend/app.js` — 5 instances (keep ASCII art)
- `frontend/formula-store.js` — 5 instances
- `frontend/charts.js` — 4 instances
- `frontend/formulas.js` — 2 instances

## Accept When

1. Zero `console.log` or `console.error` in production JS except the intentional app.js ASCII tiger easter egg
2. Fetch failures still show user-facing error toasts (existing `razzleError()` pattern)
