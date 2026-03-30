---
id: DQ-352
title: Position ALL + Relevance "All Players" silently removes position filter
priority: P2
category: UX / state corruption
page: lab.html
cycle: 46
---

## Problem

In lab.js line 1290-1291:
```js
const positions = state.position === "ALL"
  ? (state.relevance === "fantasy" ? ["QB", "RB", "WR", "TE"] : [])
  : [state.position];
```

When `position=ALL` and `relevance="all"`, `positions` becomes `[]` — an empty array. This sends no position filter to the backend, which returns ALL positions including K, DEF, P, LS, etc.

The UI still shows the "ALL" position chip as active, giving no visual indication that the filter has been silently expanded to include non-fantasy positions. Users see unexpected rows (kickers, punters) mixed in with their QB/RB/WR/TE results.

## How users hit this

1. Open the Lab (default: position=ALL, relevance=Fantasy Only)
2. Click "All Players" toggle to see non-fantasy positions
3. Results now include K/DEF/P — but the position chip still says "ALL"
4. Users expect "ALL" to mean "all fantasy positions" — it now means "literally every position"

## Fix

When `relevance="all"` and `position="ALL"`, change the ALL chip label to indicate unfiltered:
```js
// Update the ALL chip text when relevance changes
function toggleRelevance() {
  state.relevance = state.relevance === "fantasy" ? "all" : "fantasy";
  // Update ALL chip text to reflect what "ALL" means in this context
  const allChip = document.querySelector('[data-pos="ALL"]');
  if (allChip) allChip.textContent = state.relevance === "all" ? "ALL (unfiltered)" : "ALL";
  // ...
}
```

## Files
- `frontend/lab.js` (lines 1290-1291, 2988-2995)
