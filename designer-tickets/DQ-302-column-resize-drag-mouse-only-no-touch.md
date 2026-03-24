---
id: DQ-302
title: Column resize and drag-reorder are mouse-only — broken on touch
priority: P1
category: mobile-interaction
page: lab.html
---

## Problem
Two Lab power features are mouse-only:
1. **Column resize** uses `mousedown` event listener (~line 1622). Touch devices don't fire `mousedown`.
2. **Column drag-and-drop reorder** uses HTML5 `draggable="true"` + `dragstart`/`dragover`/`drop` events (~line 1603). Touch devices don't support HTML5 drag-and-drop natively.

Mobile/tablet users cannot resize or reorder columns at all.

## Expected
Both features should work on touch via `touchstart`/`touchmove`/`touchend` handlers.

## Fix
- Column resize: Add `touchstart` handler alongside `mousedown` in `_onColResizeStart`.
- Column drag: Add touch drag polyfill or a mobile-specific "move column" button in the context menu.

## Files
- `frontend/lab.js` — `_onColResizeStart` (~line 1622), `_colDragStart`/`_colDragOver`/`_colDrop` (~line 1526-1603)
