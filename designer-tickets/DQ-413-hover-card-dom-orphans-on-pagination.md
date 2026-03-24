---
id: DQ-413
title: Hover card elements orphaned in DOM on pagination — memory bloat over long sessions
priority: P1
category: performance / UX
page: lab.html
cycle: 53
---

## Problem

Player hover cards are created on `onmouseenter` (lab.js:2173) and appended to `document.body`. When the user paginates or re-renders the table, the old hover card element is not removed from the DOM. Over a long screener session with many page changes, orphaned hover card divs accumulate in the body.

## Evidence

```javascript
// lab.js:2173+ — creates hover card, appends to body
function onPlayerNameEnter(playerId, el) {
  // ... creates card element
  container.appendChild(card);
  _hoverCardVisible = true;
}
```

No cleanup happens in `renderTable()` or pagination functions. The `onPlayerNameLeave()` hides the card but doesn't remove it from DOM.

## Fix

At the top of `renderTable()`, remove any existing hover card:
```javascript
var oldCard = document.querySelector('.hover-card');
if (oldCard) oldCard.remove();
```

Or better: reuse a single hover card element instead of creating a new one each time.

## Files
- `frontend/lab.js` — lines 2173-2270 (hover card creation), renderTable function
