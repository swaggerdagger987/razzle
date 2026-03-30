---
id: DQ-383
title: Boom/bust export PNG uses hardcoded light-mode colors — ignores user theme
priority: P2
category: design system / dark mode
page: lab.js (exportBoomBustImage)
status: open
cycle: 50
---

## Problem

The `exportBoomBustImage()` function in lab.js hardcodes light-mode hex colors for the boom/bust PNG export. Users in dark mode get a light-mode colored export, breaking visual consistency. This is the same pattern as DQ-371 (standalone pages) but specifically in lab.js.

## Evidence

- `lab.js:13030` — `ctx.fillStyle = mid >= boom_threshold ? "#2ec4b6" : ...`
- `lab.js:13044, 13052` — boom line/label hardcoded #2ec4b6
- `lab.js:13058, 13066` — bust line/label hardcoded #e63946
- `lab.js:13088` — posColor + "40" (also DQ-382)
- `lab.js:13098, 13102` — floor/ceiling labels hardcoded colors

Total: ~10 hardcoded instances in the export function.

## Fix

Use `getCanvasTheme()` at the start of the export function and reference `t.green`, `t.red`, `t.text`, `t.bg`, etc., same as other export functions in lab.js.

```javascript
function exportBoomBustImage() {
  var t = getCanvasTheme();
  // Replace all #2ec4b6 → t.green
  // Replace all #e63946 → t.red
  // Replace all hardcoded text/bg colors → t.text, t.bg
}
```

## Verification

1. Switch to dark mode
2. Open Boom/Bust panel → click Export/PNG
3. Exported image should use dark mode colors (espresso background, sand text)
