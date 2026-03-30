# DES-125: Saved views load action not keyboard accessible

**Priority:** P2 — Accessibility
**Component:** lab.js
**Affects:** Saved Views manage modal

## Problem

In the Saved Views manage modal, the "load view" action is a `<div onclick>` without `role`, `tabindex`, or `onkeydown`. Keyboard users can reach the delete button (which IS a `<button>`) but cannot load a saved view without a mouse.

Saved Views is a power-user feature (save/load named screener configs). The manage modal lists all saved views — clicking a view's name loads it. This is mouse-only.

## Evidence

- `lab.js:4522-4526`:
  ```javascript
  <div style="flex:1; min-width:0;" onclick="loadSavedView('${escapeJS(v.id)}')">
  ```
- Missing: `role="button"`, `tabindex="0"`, `onkeydown` handler, `aria-label`
- Compare: the delete button on line 4524 IS a proper `<button>` element

## Fix

Change the div to a `<button>` or add `role="button" tabindex="0" aria-label="Load view: ${viewName}"` with `onkeydown` for Enter/Space.
