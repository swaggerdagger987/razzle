# DQ-007: charts.js declares position color map 3 separate times with hardcoded hex

**Priority**: P2 — dark mode and maintainability
**Category**: Color tokens
**Files**: `frontend/charts.js:341,672,1021`

## Problem

Three separate functions in charts.js each declare their own position color map:
```js
const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
```

While these hex values match the design guide today, they:
1. Don't respond to dark mode tint adjustments
2. Are duplicated 3 times (DRY violation)
3. Won't update if position color tokens ever change

## Fix

Read position colors from CSS variables once at the top of the file:
```js
const _cs = getComputedStyle(document.documentElement);
const POS_COLORS = {
  QB: _cs.getPropertyValue('--pos-qb').trim() || '#5b7fff',
  RB: _cs.getPropertyValue('--pos-rb').trim() || '#2ec4b6',
  WR: _cs.getPropertyValue('--pos-wr').trim() || '#d97757',
  TE: _cs.getPropertyValue('--pos-te').trim() || '#8b5cf6',
};
```

Then use `POS_COLORS` in all 3 functions instead of redeclaring.

## Verification

Open any chart with position colors. Toggle dark mode. Colors should still render correctly.
