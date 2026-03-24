---
id: DQ-432
priority: P2
area: lab.html / lab.js
section: URL state / navigation
type: UX gap
status: open
cycle: 56
---

# Lab screener has no popstate handler — browser back button doesn't restore state

## What's wrong

The Lab serializes screener state to the URL via `history.replaceState()` (lab.js:3826-3875) and restores from URL on page load via `loadStateFromURL()` (lab.js:3891-4005). But there is NO `popstate` event listener.

When a user presses the browser back or forward button:
1. The URL changes (browser handles this)
2. The screener does NOT re-render to match the new URL
3. The visible filters/sort/columns remain stale — out of sync with the URL bar

## Where

- `lab.js:3826-3875` — `saveStateToURL()` uses `replaceState`, not `pushState`
- `lab.js:3891-4005` — `loadStateFromURL()` exists but is only called on init
- Zero matches for `popstate` in lab.js

## Fix

1. Change `replaceState` to `pushState` for user-initiated state changes (filter add, sort change, search) so the history stack accumulates entries.
2. Add popstate listener:

```js
window.addEventListener('popstate', function() {
  loadStateFromURL();
  fetchAndRender();
});
```

## Why this matters

Browser back/forward is a fundamental navigation pattern. Users who filter to "QB + rushing yards > 500" then click a player profile expect to press Back and return to their filtered view. Currently they get the filtered URL but a stale table.
