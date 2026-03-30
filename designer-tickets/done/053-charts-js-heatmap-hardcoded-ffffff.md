# DES-053: charts.js heatmap canvas uses hardcoded #ffffff instead of t.white

**Priority**: P2
**Area**: charts.js (canvas heatmap rendering)
**Found by**: Design QA Cycle 5

## Problem

Line 766 in charts.js uses `#ffffff` for text on high-percentile heatmap cells:

```javascript
ctx.fillStyle = pct !== null && pct > 75 ? "#ffffff" : t.ink;
```

The `t` object from `getCanvasTheme()` already provides `t.white` which is `#ede0cf` in dark mode and `#fff` in light mode. Using raw `#ffffff` bypasses the theme system.

In dark mode, pure white text appears harsh against the warm espresso palette. The design system uses sand (`#ede0cf`) as the white equivalent in dark mode.

## Fix

```javascript
ctx.fillStyle = pct !== null && pct > 75 ? t.white : t.ink;
```

Single character change. The `t` variable is already in scope on this line.
