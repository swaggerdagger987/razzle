# DES-126: Column resize handles not keyboard accessible

**Priority:** P2 — Accessibility
**Component:** lab.js
**Affects:** Screener table column headers

## Problem

Column resize handles are plain `<div>` elements with only `mousedown` and `dblclick` event listeners. They have:
- No `tabindex` (not focusable)
- No `role` attribute (should be `role="separator"`)
- No ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-orientation`)
- No keyboard handlers (arrow keys for resize, Enter for reset)

Keyboard users cannot resize columns at all.

## Evidence

- `lab.js:1598` — resize handles rendered as:
  ```html
  <div class="col-resize-handle" data-col="${key}"></div>
  ```
- `lab.js:1614-1620` — `_initColResizeHandles()` adds only `mousedown` and `dblclick`:
  ```javascript
  handles[i].addEventListener("mousedown", _onColResizeStart);
  handles[i].addEventListener("dblclick", _onColResizeReset);
  ```
- No keyboard event listener added

## Fix

1. Add `role="separator" tabindex="0" aria-orientation="vertical" aria-label="Resize ${columnLabel} column" aria-valuenow="${currentWidth}"` to each handle div
2. Add `keydown` listener: Left/Right arrow keys adjust width by 10px, Enter resets to default
3. Update `aria-valuenow` during resize

This is a lower priority than other keyboard gaps because column resizing is an advanced power-user feature, and columns already have auto-width and double-click-to-reset via mouse.
