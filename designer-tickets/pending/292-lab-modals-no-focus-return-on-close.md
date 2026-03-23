---
id: DES-292
title: Lab modals don't return focus to trigger button on close
severity: P2
category: Accessibility/UX
page: lab.html
---

## What's Wrong

When Lab modals (Watchlist, Tier Board, Saved Views, Shortcuts) close via backdrop click, focus stays at the position inside the now-hidden modal instead of returning to the button that opened it. This breaks keyboard navigation flow — after closing a modal, the next Tab press jumps to an unpredictable location.

## Where

- `frontend/lab.js` line ~10156: Watchlist modal backdrop click handler
- `frontend/lab.js` line ~10245: Tier Board modal backdrop click handler
- Pattern: `overlay.onclick = function(e) { if (e.target === overlay) overlay.classList.remove("open"); };`

The close handler removes the "open" class but does NOT:
1. Store a reference to the trigger element before opening
2. Call `triggerElement.focus()` after closing
3. Implement consistent Escape key handling across all modals

## Fix

Before opening each modal, store the trigger:
```js
const _triggerEl = document.activeElement;
```

On close (both backdrop click and Escape):
```js
overlay.classList.remove("open");
if (_triggerEl) _triggerEl.focus();
```

This is the standard WAI-ARIA dialog pattern. The hamburger menu on the home page already implements this correctly — replicate that pattern.

## Evidence

Home page hamburger menu at `frontend/index.html` has proper focus return. Lab modals do not. The gap is in the JS close handlers which only toggle CSS classes.
