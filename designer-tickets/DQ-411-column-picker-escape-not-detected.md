---
id: DQ-411
title: Column Picker not closed by Escape key — isAnyOverlayOpen() misses it
priority: P0
category: UX / modal
page: lab.html
cycle: 53
---

## Problem

`isAnyOverlayOpen()` at lab.js:10473 only checks `.filter-modal-overlay.open`. The Column Picker uses `.column-picker-overlay.open` (lab.html:3542). Pressing Escape with Column Picker open does NOT close it — the handler skips to the next priority (blur input or clear highlights).

User opens Column Picker (C key), presses Escape expecting it to close, but nothing happens. They have to click outside to dismiss.

## Evidence

```javascript
// lab.js:10473 — only checks filter-modal-overlay
function isAnyOverlayOpen() {
  const overlays = document.querySelectorAll(".filter-modal-overlay.open");
  return overlays.length > 0;
}
```

```html
<!-- lab.html:3542 — Column Picker uses different class -->
<div class="column-picker-overlay" id="columnPickerOverlay" ...>
```

## Fix

Update `isAnyOverlayOpen()` and `closeAllOverlays()` to also check `.column-picker-overlay.open`:

```javascript
function isAnyOverlayOpen() {
  return document.querySelectorAll(".filter-modal-overlay.open, .column-picker-overlay.open").length > 0;
}
function closeAllOverlays() {
  document.querySelectorAll(".filter-modal-overlay.open, .column-picker-overlay.open").forEach(el => el.classList.remove("open"));
}
```

## Files
- `frontend/lab.js` — lines 10473-10480
