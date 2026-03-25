<!-- PM: ready -->
---
id: DQ-431
priority: P2
area: all pages (app.js)
section: auth / state sync
type: UX gap
status: open
cycle: 56
---

# No cross-tab localStorage sync — login on Tab A invisible to Tab B

## What's wrong

Zero `window.addEventListener('storage', ...)` handlers exist anywhere in the frontend. When a user logs in on Tab A, Tab B still shows the logged-out state. The token is written to localStorage, but Tab B's in-memory state never updates.

Affected operations on stale tabs:
- Auth state (razzle_token, razzle_user) — Tab B shows "Sign In" while user is logged in
- Watchlist sync — edits on Tab A don't appear on Tab B
- Saved views — new views on Tab A invisible on Tab B
- Theme toggle — switching theme on Tab A doesn't propagate

## Where

- `frontend/app.js` — no `storage` event listener
- `frontend/lab.js` — no `storage` event listener
- `frontend/formulas.js` — no `storage` event listener

## Fix

Add a storage event listener in app.js that handles key auth changes:

```js
window.addEventListener('storage', function(e) {
  if (e.key === 'razzle_token' || e.key === 'razzle_user') {
    // Re-check auth state and update UI
    updateAuthUI();
  }
  if (e.key === 'razzle_theme') {
    document.documentElement.dataset.theme = e.newValue || 'light';
  }
});
```

## Why this matters

Multi-tab usage is common — users keep the Lab open while browsing pricing or connecting their league in another tab. Logging in on the pricing tab should immediately update the Lab tab's auth state.
