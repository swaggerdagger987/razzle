---
id: DQ-303
title: Right-click context menu has no touch/long-press alternative
priority: P1
category: mobile-interaction
page: lab.html
---

## Problem
The table context menu (column management, sort, hide, stats) is triggered by `contextmenu` event only (~line 2553). On mobile/tablet, there is no right-click. Some browsers fire `contextmenu` on long-press, but this is inconsistent (especially iOS Safari, which shows the native context menu instead).

Users on touch devices lose access to: hide column, sort ascending/descending, column stats popover, and all row context menu actions (profile, compare, watchlist, pin, highlight, copy).

## Expected
Long-press (500ms+) on a table header or row should show the custom context menu. Alternatively, add a "..." overflow button on each header/row for touch.

## Fix
Add `touchstart`/`touchend` handlers with a 500ms timer to trigger context menu on long-press. Cancel on `touchmove` (scroll). Prevent native context menu with `e.preventDefault()` only when custom menu fires.

## Files
- `frontend/lab.js` — context menu event listener (~line 2553)
- `frontend/lab.js` — `_showContextMenu()` function
