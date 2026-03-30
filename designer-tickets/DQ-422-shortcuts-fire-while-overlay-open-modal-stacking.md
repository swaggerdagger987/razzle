---
id: DQ-422
title: Keyboard shortcuts fire while overlays are open — causes modal stacking
priority: P1
category: UX / modal
page: lab.html
cycle: 54
---

## Problem

The global keydown handler (lab.js:10487) checks `isInputFocused()` at line 10530 before firing shortcuts, but does NOT check `isAnyOverlayOpen()`. This means:

1. User opens Watchlist (W key)
2. Watchlist overlay is open (no input focused)
3. User presses S → `openSavedViews()` fires → Saved Views opens ON TOP of Watchlist
4. Now two overlays are stacked. Escape closes both at once (via closeAllOverlays).

Affected shortcuts: S (Saved Views), C (Column Picker), F (Formula Builder), M (Formula Store), W (Watchlist), E (Export), ? (Shortcuts Ref), 1-5 (position filters), B (data bars), H (heat), D (density), T (tiers), G (groups), A (summary), V (visual cycle), L (leaders).

Additionally, `openColumnPicker()`, `openSavedViews()`, and `toggleShortcutRef()` don't close existing overlays before opening. Only `openTierBoard()` properly closes the watchlist first (line 10233-10235).

## Why it matters

Users who use keyboard shortcuts (the power user target audience) will accidentally stack overlays. The stacked state is confusing — Escape nukes everything, and the visual layering is wrong.

## Fix

Add a guard after `isInputFocused()` in the global keydown handler:

```javascript
if (isInputFocused()) return;
if (isAnyOverlayOpen()) return; // ← ADD THIS LINE
```

AND add `closeAllOverlays()` at the top of each overlay open function:

```javascript
function openColumnPicker() {
  closeAllOverlays(); // ← ADD
  document.getElementById("columnPickerOverlay").classList.add("open");
  // ...
}
```

## Files
- `frontend/lab.js` — line 10530 (missing guard), lines 3471, 4257, 10711 (missing close-before-open)
