<!-- PM: ready -->
# DQ-412: fetchAndRender() doesn't dismiss floating UI before re-render

**Priority**: P1
**Category**: Interaction Lifecycle
**Files**: `frontend/lab.js` (lines ~1265-1281)

## Problem

`fetchAndRender()` is called from 40+ places in lab.js: `toggleTagFilter()`, `setUniverse()`, `setCollegeView()`, double-click stat cell, context menu sort, `addFilter()`, column picker close, etc. It re-fetches data and rebuilds the table.

It does NOT call `closeAllOverlays()` or dismiss any floating UI before doing so. If a user has a popover, tooltip, context menu, hover card, tag picker, or note editor open when fetchAndRender triggers:

1. The table re-renders underneath
2. The floating element stays orphaned in the DOM
3. It references DOM nodes that no longer exist
4. Clicks on the orphaned element do nothing or throw errors

## What the user sees

- Open column stats popover → sort that column via context menu → popover stays frozen at old position
- Open tag picker → add a filter → table re-renders → tag picker floats over wrong row
- Hover card visible → shift-click sort → card stays showing stale player

## Fix

Add `dismissAllFloatingUI()` as the first line of `fetchAndRender()`. This function should close: hover card, tag picker, note editor, context menu, column stats popover.
