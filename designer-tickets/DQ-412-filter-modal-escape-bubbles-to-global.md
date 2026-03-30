---
id: DQ-412
title: Filter modal Escape event bubbles — blurs search input or clears highlights unexpectedly
priority: P1
category: UX / modal
page: lab.html
cycle: 53
---

## Problem

When user presses Escape to close a filter modal, `closeFilterModal()` (lab.js:3230) removes the `.open` class but does NOT call `e.stopPropagation()` or `e.preventDefault()`. The Escape keydown event continues to the global handler (lab.js:10487), which then:

1. Checks overlays (now closed) — passes
2. Checks focused input — blurs it
3. Or clears row highlights

User closes filter modal with Escape, then their search input unexpectedly loses focus or highlighted rows get cleared.

## Evidence

```javascript
// lab.js:3230 — no propagation stop
function closeFilterModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("filterModalOverlay").classList.remove("open");
}
```

## Fix

The filter modal's Escape handler (inside the overlay's own keydown listener or the global handler's overlay-close branch) should call `e.stopPropagation()` after closing the overlay. Or: the global handler at line 10501-10504 already does `e.preventDefault(); return;` — the bug is that the overlay was ALREADY closed by the modal's own handler before the global handler runs, so `isAnyOverlayOpen()` returns false.

Best fix: in the global Escape handler, close overlays AND return in one step. Don't rely on external close handlers.

## Files
- `frontend/lab.js` — lines 3230-3232, 10487-10519
