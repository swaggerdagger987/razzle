# DES-119: No offline or connection-loss detection

**Priority:** P2 — Resilience / UX
**Component:** app.js
**Affects:** All pages

## Problem

The codebase has zero `navigator.onLine` checks and zero `offline`/`online` event listeners. If a user loses internet connection (common on mobile — the primary traffic source from Twitter/Reddit), API calls silently fail. The error toast says "try again" but the real issue is connectivity, not a server problem.

## Evidence

- `grep -r "navigator.onLine" frontend/` — 0 results
- `grep -r "addEventListener.*offline" frontend/` — 0 results
- `grep -r "addEventListener.*online" frontend/` — 0 results
- Only "offline" text found: `agent-config.js` strings like "Film room offline" (copy, not detection)

## Fix

In `app.js`, add connection monitoring:

```javascript
// Show persistent banner when offline
window.addEventListener('offline', () => {
  _showToast('You appear to be offline. Reconnect to keep exploring.', 'warning', 0);
});

// Dismiss banner when back online
window.addEventListener('online', () => {
  _showToast('Back online.', null, 2000);
});
```

Optionally, in `apiFetch()`: check `navigator.onLine` before making the request and show a more specific error message ("You're offline — check your connection") instead of the generic "server fumbled."

## Why it matters

Mobile traffic from Twitter/Reddit frequently has intermittent connectivity (subway, weak signal, background tab). A clear "you're offline" message prevents users from thinking the site is broken when the issue is their connection.
