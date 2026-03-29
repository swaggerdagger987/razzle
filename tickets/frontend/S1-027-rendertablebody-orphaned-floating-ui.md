---
id: S1-027
severity: S1
category: frontend
finding_ref: DQ-423
confidence: HIGH
---

# S1-027: renderTableBody() leaves orphaned floating UI elements

## Root Cause

`frontend/lab.js:2034` -- `renderTableBody()` rebuilds the table DOM but never
dismisses open floating UI elements. If a tag picker, note editor, context menu,
or colStats popover is open when a re-render fires (pagination, sort, filter),
the floating element remains on screen anchored to a now-stale DOM node.

The dismiss functions all exist in the same file:
- `hideTagPicker()` at `lab.js:523`
- `hideNoteEditor()` at `lab.js:641`
- `dismissColumnStatsPopover()` at `lab.js:3603`
- Context menu hide (via document click handler)

But none are called from `renderTableBody()`.

## What to Fix

Add dismiss calls at the top of `renderTableBody()`, before the DOM rebuild:

```js
function renderTableBody() {
  // Dismiss all floating UI before rebuilding table
  if (typeof hideTagPicker === 'function') hideTagPicker();
  if (typeof hideNoteEditor === 'function') hideNoteEditor();
  if (typeof dismissColumnStatsPopover === 'function') dismissColumnStatsPopover();
  var ctx = document.querySelector('.ctx-menu');
  if (ctx) ctx.style.display = 'none';
  // ... existing code
}
```

## Files to Change

- `frontend/lab.js` -- add floating UI dismiss to `renderTableBody()`

## Acceptance Criteria

- [ ] Open a tag picker on a player row, then change sort -- picker disappears
- [ ] Open colStats popover on a column, then paginate -- popover disappears
- [ ] Open context menu, then apply a filter -- menu disappears
- [ ] No JavaScript errors from stale DOM references after re-render

## Do NOT

- Do not refactor the floating UI system -- just add dismiss calls
