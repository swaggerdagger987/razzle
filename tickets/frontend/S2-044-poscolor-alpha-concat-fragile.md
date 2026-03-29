# S2-044: posColor+"40" hex alpha concat is fragile pattern

**Severity**: S2 (Medium)
**Category**: frontend
**Source**: designer-tickets/DQ-382
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/lab.js:12977,13201` — Canvas drawing code concatenates hex color + "40" to create alpha transparency: `ctx.fillStyle = posColor + "40"`. This assumes `posColor` is always a 6-digit hex string like `#5b7fff`. If CSS variables ever change format (to rgb/hsl/oklch), this produces invalid CSS.

```javascript
// lab.js:12977 (exportFloorCeilingImage)
ctx.fillStyle = posColor + "40";

// lab.js:13201 (exportBoomBustImage)
ctx.fillStyle = posColor + "40";
```

`posColor` comes from `_getPosColorsHex()` (lab.js:33-36) which reads computed styles from CSS variables.

**Current impact**: Low — position colors don't change in dark mode and are always hex values. But the pattern is fragile and exists in 4 places:
- `lab.js:12977` — posColor + "40"
- `lab.js:13201` — posColor + "40"
- `lab.js:6376` — dvsColor + "30"
- `charts.js:1116` — dvsColor + "30"

## Fix

Replace string concatenation with a helper that handles any color format:
```javascript
function withAlpha(hexColor, alpha) {
  // alpha is 0-1 float
  return hexColor + Math.round(alpha * 255).toString(16).padStart(2, '0');
}
```
Or use canvas `globalAlpha` property instead of embedding alpha in the color string.

## Files to Change

- `frontend/lab.js:12977,13201,6376`
- `frontend/charts.js:1116`

## Accept When

1. No raw `+ "40"` / `+ "30"` color concatenation in JS files
2. Canvas renders same visual output

## Do NOT Touch

- CSS variable definitions
- `_getPosColorsHex()` function
