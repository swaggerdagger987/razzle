---
id: DQ-423
title: renderTableBody() doesn't dismiss floating UI — orphaned tag picker, note editor, context menu, colStats popover
priority: P1
category: UX / performance
page: lab.html
cycle: 54
---

## Problem

When the screener table re-renders (via `renderTableBody()` on filter change, sort, pagination, or universe switch), four floating UI elements are NOT dismissed:

1. **Tag picker** — positioned relative to a specific row's tag badge. After re-render, the anchor element is destroyed but the picker floats over wrong content.
2. **Note editor** — same pattern, positioned relative to a note cell.
3. **Context menu** — positioned relative to a right-clicked row.
4. **ColStats popover** — positioned relative to a column header.

`renderTableBody()` at lab.js:2010 rebuilds `tbody.innerHTML` but never calls `hideTagPicker()`, `hideNoteEditor()`, `hideContextMenu()`, or `dismissColumnStatsPopover()`.

## Evidence

```javascript
function renderTableBody() {
  _expandedRows = {};
  const tbody = document.getElementById("tableBody");
  // ... rebuilds innerHTML ...
  // ← NO cleanup of floating elements
}
```

Meanwhile, `dismissColumnStatsPopover()` exists (line 3667) but is only called from its own open/close handlers, never from renderTable.

## Why it matters

After any filter change or pagination, orphaned floating elements confuse users. The tag picker shows tags for the wrong player. The colStats popover shows stats for a column that may have shifted position. Users must click elsewhere to dismiss — unintuitive.

## Fix

Add cleanup at the top of `renderTableBody()`:

```javascript
function renderTableBody() {
  hideTagPicker();
  hideNoteEditor();
  hideContextMenu();
  dismissColumnStatsPopover();
  _expandedRows = {};
  // ...
}
```

## Files
- `frontend/lab.js` — line 2010 (renderTableBody), lines 511/629/2441/3667 (dismiss functions)
