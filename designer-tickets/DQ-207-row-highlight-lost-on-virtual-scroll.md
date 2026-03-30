---
id: DQ-207
priority: P2
category: interaction / UX
status: open
---

# Row highlight styling lost when Lab table re-renders (virtual scroll)

## Problem

In the Lab screener, users can click rows to toggle orange highlight (`.row-highlighted` class). However, this highlight is applied as a DOM class and is NOT persisted in the application state. When the table re-renders (page change, filter change, or virtual scroll rebuild), all highlights are lost.

Checkbox selection (`state.selectedPlayers` + `_selectedSet`) correctly survives re-renders because it's stored in state. Row highlighting uses only CSS classes on DOM elements.

## Evidence

Row highlight toggle (lab.js ~line 2336): applied via `classList.toggle('row-highlighted')` on the `<tr>` element.

Checkbox selection (lab.js ~line 1788): reads from `_selectedSet` which is derived from `state.selectedPlayers`.

When `renderTable()` is called, it rebuilds the entire `<tbody>` innerHTML. The new `<tr>` elements don't have `.row-highlighted` because that state only existed on the old DOM.

## Fix

Add `state.highlightedPlayers` (a Set of player keys). When toggling highlight, add/remove from the Set. When rendering rows, check the Set and add the class:

```javascript
// In buildRowHTML:
const highlighted = state.highlightedPlayers?.has(playKey);
html += `<tr class="${highlighted ? 'row-highlighted' : ''}" ...>`;
```

## Files
- `frontend/lab.js` — row highlight toggle (~line 2336), buildRowHTML (~line 1780+)
