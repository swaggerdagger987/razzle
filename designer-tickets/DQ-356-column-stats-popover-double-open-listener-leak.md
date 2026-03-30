---
id: DQ-356
title: Column stats popover double-open race condition leaks event listeners
priority: P2
category: UX / performance
page: lab.html
cycle: 46
---

## Problem

In lab.js lines 3640-3674, the Column Stats popover adds three event listeners (click, keydown, scroll) via `setTimeout(..., 0)`:

```js
setTimeout(function() {
  document.addEventListener("click", _colStatsOutsideClick, true);
  document.addEventListener("keydown", _colStatsEscDismiss, true);
  wrap.addEventListener("scroll", _colStatsScrollDismiss, { passive: true });
}, 0);
```

If a user right-clicks a column header twice in quick succession before the `setTimeout` fires from the first open, listeners are registered multiple times. The `dismissColumnStatsPopover()` cleanup only removes one set, leaving orphaned listeners.

Result: Escape key may trigger multiple dismiss calls, scroll events fire multiple handlers, and keyboard shortcuts (like `?` for help) may be intercepted by the orphaned keydown handler.

## Not a duplicate of

- DES-157: covers lab-PANELS.js (197 addEventListener with 0 removeEventListener). This is lab.js column stats popover — different file, different mechanism, different fix.

## Fix

Add a guard flag:
```js
var _colStatsListenersAttached = false;

// In openColumnStatsPopover:
if (!_colStatsListenersAttached) {
  _colStatsListenersAttached = true;
  setTimeout(function() { /* add listeners */ }, 0);
}

// In dismissColumnStatsPopover:
_colStatsListenersAttached = false;
// existing removeEventListener calls
```

## Files
- `frontend/lab.js` (lines 3640-3674)
