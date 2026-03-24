---
id: DQ-368
title: Canvas chart pages have no getContext('2d') null check — no graceful degradation
priority: P3
category: UX / browser compat
page: aging.html, explorer.html, weekly.html (canvas pages)
cycle: 47
---

## Problem

Canvas-based chart pages (aging curves, stat explorer, weekly heatmap) call `canvas.getContext('2d')` without checking if the result is null. In some contexts (OffscreenCanvas limits, hardware acceleration disabled, browser restrictions), `getContext` can return null.

Example from aging.html line ~443:
```js
var ctx = canvas.getContext('2d');
// Immediately starts drawing with ctx — no null check
ctx.clearRect(0, 0, canvas.width, canvas.height);
```

If ctx is null, this throws an uncaught TypeError and the entire chart section goes blank with no explanation.

## Not a duplicate of

- DQ-183: canvas fallback colors hardcoded to #fff in dark mode (color values, not context failure)
- DQ-242: canvas sprite load infinite loop (pixel canvas, not chart canvas)

## Fix

Add a null guard after getContext:
```js
var ctx = canvas.getContext('2d');
if (!ctx) {
  canvas.parentElement.innerHTML = '<p style="color:var(--ink-light);font-family:var(--font-hand);padding:20px;">chart unavailable on this browser</p>';
  return;
}
```

Apply to all chart canvas pages.

## Files
- `frontend/aging.html` (~line 443)
- `frontend/explorer.html` (stat scatter)
- `frontend/weekly.html` (heatmap canvas)
- Any other canvas-based standalone pages
