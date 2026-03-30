---
id: DQ-372
title: Canvas resize handlers in aging.html and explorer.html fire without debounce
priority: P3
category: performance / visual
page: aging.html, explorer.html
status: open
cycle: 49
---

## Problem

Two canvas-heavy pages add raw `window.addEventListener('resize', ...)` handlers that redraw the entire canvas on every pixel of browser resize. This causes visible jank — the canvas flickers and redraws dozens of times per second during resize.

- `aging.html:793` — redraws aging curve canvas on every resize event
- `explorer.html:730` — redraws scatter plot canvas on every resize event

Meanwhile, `lab.js` correctly uses debounce for similar operations (7 debounce calls). These two pages skipped the pattern.

## Evidence

```bash
grep -n "addEventListener('resize'" frontend/aging.html frontend/explorer.html
# aging.html:793: window.addEventListener('resize', function() {
# explorer.html:730: window.addEventListener('resize', function() {
```

```bash
grep -c "debounce" frontend/aging.html frontend/explorer.html
# aging.html: 0
# explorer.html: 0
```

## Fix

Wrap both resize handlers with a simple debounce (200ms):

```javascript
var _resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(function() { drawChart(); }, 200);
});
```

## Verification

Resize browser window while viewing aging curves or stat explorer. Canvas should redraw once after resize stops, not continuously during resize.
