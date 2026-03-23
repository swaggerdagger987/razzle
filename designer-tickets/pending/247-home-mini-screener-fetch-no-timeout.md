# DES-247: Home page mini-screener API fetch has no timeout

**Priority**: P1
**Area**: index.html (home page)
**Cycle**: 24

## Problem

The home page live mini-screener fetches player data at line 1018:

```js
fetch('/api/players?limit=60&sort=ppg&order=desc')
```

There is no `AbortController`, no `setTimeout` wrapper, and no timeout mechanism. On slow mobile networks (62% of fantasy football traffic per market research), "pulling film..." shows indefinitely with no error feedback. The browser default timeout is 5-15 minutes.

DES-150 covers the Lab screener fetch timeout. This is a DIFFERENT fetch on the HOME PAGE — the first thing visitors see.

## Evidence

- `index.html:1018` — raw `fetch()` with no timeout
- No `AbortController` anywhere in the home page script block
- Error fallback exists in `.catch()` (line 1032) but only fires on network failure, not slow response

## Fix

Add a 10-second timeout using AbortController:

```js
var _miniCtrl = new AbortController();
setTimeout(function() { _miniCtrl.abort(); }, 10000);
fetch('/api/players?limit=60&sort=ppg&order=desc', { signal: _miniCtrl.signal })
```

On timeout, show the existing fallback message: "couldn't reach the film room."

## Why This Matters

The home page is the #1 conversion page. Mobile users on slow connections get a broken first impression — an infinite loading state with no feedback. This loses exactly the users the funnel is designed to capture.
