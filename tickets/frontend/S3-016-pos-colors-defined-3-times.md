# S3-016: POS_COLORS defined 3 times — consolidate to one source

**Severity**: S3 (Low)
**Category**: ui-bug
**Source**: EDGE-CASES.md #64
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause

Position color constants (QB blue, RB teal, WR terracotta, TE purple) are defined independently in three files:
- `frontend/compare.js`
- `frontend/player.js`
- `frontend/charts.js`

If one is updated and others aren't, colors diverge.

## Fix

Define `POS_COLORS` once in `frontend/app.js` (shared) and reference from other files:
```javascript
// app.js
window.POS_COLORS = { QB: '#5b7fff', RB: '#2ec4b6', WR: '#d97757', TE: '#8b5cf6' };
```

Remove duplicate definitions from compare.js, player.js, charts.js.

## Files to Change

- `frontend/app.js` — add canonical POS_COLORS
- `frontend/compare.js` — remove duplicate, use window.POS_COLORS
- `frontend/player.js` — same
- `frontend/charts.js` — same

## Accept When

`POS_COLORS` defined exactly once. All three consumer files reference the shared definition.
