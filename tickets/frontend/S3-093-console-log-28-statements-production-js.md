---
id: S3-093
severity: S3
confidence: MEDIUM
category: performance
source: docs/reviews/2026-03-14-evidence-collector.md #9
status: OPEN
---

# 28 console.log/error statements in production JS files

## Root Cause (UPDATED 2026-03-29 — code investigation)

**Investigation found only 5 `console.log` statements**, all in `frontend/app.js` and all intentional:

- `app.js:1780` — Branded ASCII tiger art (orange `%c` styled)
- `app.js:1781` — "razzle.lol — the fantasy football research lab" (styled)
- `app.js:1784` — Developer utility docs: `razzle.tiger()`, `razzle.stats()`, `razzle.version`
- `app.js:1785` — Tiger ASCII art (same as 1780, for `razzle.tiger()`)
- `app.js:1786` — Page stats: pathname, scripts count, stylesheets count

**These are an intentional brand easter egg** — part of the `window.razzle` developer utility object. Dynasty managers who open DevTools see the tiger.

The original count of 28 included `console.error` and `console.warn` statements in other files — those are appropriate error handling, not debug logging.

**Previous counts for reference** (these are `console.error`/`console.warn`, which should be kept):
- `frontend/lab.js` — error logging on fetch failures
- `frontend/formula-store.js` — API error logging
- `frontend/charts.js` — canvas error logging
- `frontend/formulas.js` — formula parse error logging

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
