# S1-006: Watchlist cross-tab race condition — no storage event listener

**Severity**: S1 (High)
**Category**: ui-bug
**Source**: EDGE-CASES.md #27
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/lab.js:230-299` — Watchlist reads/writes localStorage but has no `storage` event listener for cross-tab synchronization.

```javascript
// lab.js:233-239
function getWatchlist() {
  try { return JSON.parse(localStorage.getItem("razzle_watchlist") || "[]"); }
  catch(e) { return []; }
}

// lab.js:241-248
function saveWatchlist(list) {
  localStorage.setItem("razzle_watchlist", JSON.stringify(list));
  // Cloud sync follows...
}
```

Lines 285-299 implement one-way cloud PULL but no cross-tab detection. Scenario:
1. Tab A adds player X to watchlist → saves to localStorage
2. Tab B still has stale watchlist in memory
3. Tab B adds player Y → overwrites localStorage with stale list (missing player X)
4. Player X is lost

## Fix

Add a `storage` event listener in lab.js initialization:

```javascript
window.addEventListener('storage', function(e) {
  if (e.key === 'razzle_watchlist') {
    // Reload watchlist from localStorage and re-render
    state.watchlist = getWatchlist();
    renderTable();
  }
});
```

## Files to Change

- `frontend/lab.js` — add `storage` event listener near line 230 (watchlist section)

## Accept When

1. Open two tabs with the Lab
2. Add a player to watchlist in Tab A
3. Tab B's watchlist updates automatically (within 1 second, no refresh needed)
4. No data loss when both tabs modify watchlist

## Do NOT Touch

- Cloud sync logic (lines 285-299) — that handles server-side persistence
- `saveWatchlist()` function — keep it as-is, just add the listener
