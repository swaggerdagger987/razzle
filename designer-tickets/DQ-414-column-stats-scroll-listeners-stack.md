---
id: DQ-414
title: Column stats popover scroll listeners stack on rapid right-click usage
priority: P1
category: performance
page: lab.html
cycle: 53
---

## Problem

The column stats popover (right-click column header → "Column Stats") attaches a scroll listener to `.table-wrap` for auto-dismiss (lab.js:3645). `dismissColumnStatsPopover()` removes the listener (lab.js:3663), but if the user opens a new popover BEFORE the old one is dismissed, a new scroll listener is attached without the old one being cleaned up first. Rapid right-click → open/close cycles accumulate stale scroll listeners.

## Evidence

```javascript
// lab.js:3645 — attaches scroll listener
var wrap = document.querySelector(".table-wrap");
if (wrap) wrap.addEventListener("scroll", _colStatsScrollDismiss);

// lab.js:3663 — removes on dismiss
if (wrap) wrap.removeEventListener("scroll", _colStatsScrollDismiss);
```

If `_colStatsScrollDismiss` is reassigned (new function reference) before the old one is removed, `removeEventListener` won't find the old reference. The old listener stays attached forever.

## Fix

Call `dismissColumnStatsPopover()` at the TOP of the column stats popover creation function, before creating a new popover. This ensures old listeners are cleaned before new ones are attached.

## Files
- `frontend/lab.js` — lines 3640-3674
