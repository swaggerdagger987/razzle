---
id: DQ-424
title: Hover card _hoverTimer fires after table re-render — stale DOM access
priority: P2
category: performance / UX
page: lab.html
cycle: 54
---

## Problem

When a user hovers over a player name, `onPlayerNameEnter()` sets a 300ms timer (lab.js:2260):

```javascript
_hoverTimer = setTimeout(function() {
  showHoverCard(playerId, el);
}, 300);
```

If the user triggers a table re-render within that 300ms (e.g., by clicking a filter badge while hovering), the timer still fires. It calls `showHoverCard()` with:
- `el` — a reference to the old anchor element that's been replaced by innerHTML
- `playerId` — a valid ID, but the hover card is positioned relative to a stale DOM node

The hover card may appear at coordinates (0, 0) or at the old element's last-known position.

Similarly, `onPlayerNameLeave()` (lab.js:2266-2270) sets a 200ms dismiss timer that can fire after re-render, trying to hide a card that may have already been orphaned.

## Why it matters

Race condition during fast interactions. Users who hover and immediately filter will see a hover card flash at the wrong position. Minor visual glitch but degrades trust in the UI.

## Fix

Clear hover timers at the top of `renderTableBody()`:

```javascript
clearTimeout(_hoverTimer);
hideHoverCard();
```

## Files
- `frontend/lab.js` — lines 2259-2270 (_hoverTimer), line 2010 (renderTableBody missing cleanup)
