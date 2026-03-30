---
id: DQ-381
title: Boom/bust canvas functions use hardcoded hex instead of getCanvasTheme()
priority: P2
category: design system / dark mode
page: lab.js (boom/bust panel)
status: open
cycle: 50
---

## Problem

The boom/bust histogram and range bar canvas drawing functions use hardcoded hex colors (#2ec4b6 for green/boom, #e63946 for red/bust) instead of the established `getCanvasTheme()` helper. Every other canvas panel in lab.js uses the theme helper — boom/bust is the exception.

## Evidence

- `lab.js:12762` — `ctx.fillStyle = "#2ec4b6";` (boom bucket fill)
- `lab.js:12764` — `ctx.fillStyle = "#e63946";` (bust bucket fill)
- `lab.js:12800, 12808` — boom threshold line hardcoded green
- `lab.js:12817, 12825` — bust threshold line hardcoded red
- `lab.js:12878` — `ctx.fillStyle = "#e63946";` (floor label)
- `lab.js:12882` — `ctx.fillStyle = "#2ec4b6";` (ceiling label)

Total: ~12 hardcoded hex instances across drawBoomBustHistogram() and drawBoomBustRangeBar().

## Fix

Replace all hardcoded hex with `t.green` and `t.red` from `getCanvasTheme()`:

```javascript
var t = getCanvasTheme();
// ctx.fillStyle = "#2ec4b6" →
ctx.fillStyle = t.green;
// ctx.fillStyle = "#e63946" →
ctx.fillStyle = t.red;
```

## Verification

Open Lab → Boom/Bust panel in dark mode. Histogram bars and threshold lines should render with theme-appropriate colors, not hardcoded light-mode hex.
