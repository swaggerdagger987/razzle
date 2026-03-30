---
id: DQ-339
title: Home page mini-screener fetch has no AbortController and no timeout
priority: P3
category: ux/reliability
page: index.html
cycle: 44
---

## Problem

The home page live mini-screener fetches player data with no timeout and no AbortController:

```js
// index.html line 1018
fetch('/api/players?limit=60&sort=ppg&order=desc')
  .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(function(data) { ... })
  .catch(function() { ... fallback ... });
```

If the API is slow (e.g., cold start on Render, database lock, network issue), the mini-screener shows "pulling film..." indefinitely. The error fallback only fires on network failure, not on timeout.

This is the **home page** — first impression for every visitor. A hung loading state on the hero section is the worst possible first experience.

## Evidence

- Line 1018: raw `fetch()` — no AbortController
- No `setTimeout` wrapper for a timeout fallback
- DQ-122 (fetch-no-timeout) covers lab-panels.js and warroom.js but does NOT mention index.html
- DQ-327 (raw fetch vs apiFetch) covers 12 standalone pages but does NOT mention index.html

## Expected

The mini-screener should timeout after 5 seconds and show the fallback message rather than hanging.

## Fix

```js
var ac = new AbortController();
var timer = setTimeout(function() { ac.abort(); }, 5000);

fetch('/api/players?limit=60&sort=ppg&order=desc', { signal: ac.signal })
  .then(function(r) { clearTimeout(timer); if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(function(data) { ... })
  .catch(function() {
    clearTimeout(timer);
    // Show fallback
  });
```

5 lines changed. Prevents infinite loading on the home page hero.

## Files
- `frontend/index.html` (line 1018)
