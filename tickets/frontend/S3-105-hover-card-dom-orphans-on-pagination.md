---
id: S3-105
severity: S3
confidence: HIGH
category: frontend
source: DQ-413
status: OPEN
---

# Hover card DOM orphans persist after pagination

## Root Cause

`renderTableBody()` dismisses tag picker, note editor, context menu, and column stats popover before rebuilding the table, but does NOT dismiss the hover card. When pagination changes, a visible hover card remains attached to a now-destroyed row.

**File**: `frontend/lab.js:2060-2066`

```javascript
function renderTableBody() {
  if (typeof hideTagPicker === 'function') hideTagPicker();
  if (typeof hideNoteEditor === 'function') hideNoteEditor();
  if (typeof dismissColumnStatsPopover === 'function') dismissColumnStatsPopover();
  var ctxMenu = document.querySelector('.ctx-menu');
  if (ctxMenu) ctxMenu.style.display = 'none';
  // Missing: hideHoverCard()
```

Pagination at `frontend/lab.js:3195-3203` calls `fetchAndRender()` which calls `renderTableBody()`.

## Fix

Add `hideHoverCard()` call to the floating UI cleanup block in `renderTableBody()`:

```javascript
if (typeof hideHoverCard === 'function') hideHoverCard();
```

## Acceptance Criteria

- [ ] Hover card is dismissed when pagination changes
- [ ] No orphaned hover cards visible after table re-render
- [ ] Hover card still works on new rows after pagination
