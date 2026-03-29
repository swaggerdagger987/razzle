# S3-017: Formula builder has no division-by-zero or NaN protection

**Severity**: S3 (Low)
**Category**: ui-bug
**Source**: EDGE-CASES.md #65
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause

`frontend/formulas.js:38-96` — Custom formula evaluation doesn't guard against division by zero. A formula like `rushing_yards / games_played` where `games_played` is 0 produces `Infinity` or `NaN` in the table.

## Fix

Wrap formula evaluation in a guard:
```javascript
var result = evaluate(formula, playerStats);
if (!isFinite(result)) result = 0;  // or null to show "—"
```

## Files to Change

- `frontend/formulas.js:38-96`

## Accept When

Formula results never show `Infinity`, `NaN`, or `-Infinity` in the table. Division by zero returns 0 or "—".
