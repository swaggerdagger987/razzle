# DQ-008: charts.js uses hardcoded accent hex colors for canvas drawing

**Priority**: P2 — charts don't respond to dark mode
**Category**: Color tokens
**Files**: `frontend/charts.js:3,379,387,450,491,533,549,561`

## Problem

Canvas drawing operations in charts.js use hardcoded hex values for accent colors:
- `"#d97757"` (orange) — line 3, 379, 561
- `"#e63946"` (red) — line 387
- `"#2ec4b6"` (green) — line 450, 491
- `"#5b7fff"` (blue) — line 533, 549

These are correct for light mode but won't adjust for dark mode. Canvas doesn't inherit CSS variables, so these need to be read from computed styles.

## Fix

At the top of charts.js (or in each function), read accent colors from CSS:
```js
const _cs = getComputedStyle(document.documentElement);
const COLORS = {
  orange: _cs.getPropertyValue('--orange').trim(),
  red: _cs.getPropertyValue('--red').trim(),
  green: _cs.getPropertyValue('--green').trim(),
  blue: _cs.getPropertyValue('--blue').trim(),
};
```

Use `COLORS.orange` instead of `"#d97757"` in all canvas operations.

## Verification

Open any chart (radar, scatter, trend). Toggle dark mode. Chart colors should render using the live CSS variable values.
