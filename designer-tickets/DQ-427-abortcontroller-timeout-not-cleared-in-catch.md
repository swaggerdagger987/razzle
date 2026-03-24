---
id: DQ-427
title: AbortController timeout not cleared in catch block — orphaned timers on fetch failure
priority: P2
category: performance
page: agents.html (Situation Room)
cycle: 54
---

## Problem

Several fetch wrappers in warroom.js create an AbortController with a 10-second timeout:

```javascript
var ac = new AbortController();
var timer = setTimeout(function() { ac.abort(); }, 10000);
try {
  const resp = await fetch(path, { signal: ac.signal });
  clearTimeout(timer); // ← only cleared on success
  // ...
} catch (e) {
  // ← timer NOT cleared if fetch rejects
}
```

If the fetch rejects (network error, CORS failure, DNS timeout) BEFORE reaching `clearTimeout()`, the 10-second timer remains alive. It eventually fires and calls `ac.abort()` on an already-dead controller — harmless but wasteful. With repeated API failures (e.g., OpenRouter rate-limited), orphaned timers accumulate.

## Evidence

This pattern appears at warroom.js lines ~1990-1994, ~2404-2405, ~2460-2461, ~2505-2506 (multiple fetch wrappers for agent config, roster, and briefing).

## Fix

Move `clearTimeout` into a `finally` block:

```javascript
var ac = new AbortController();
var timer = setTimeout(function() { ac.abort(); }, 10000);
try {
  const resp = await fetch(path, { signal: ac.signal });
  // ...
} catch (e) {
  // handle error
} finally {
  clearTimeout(timer);
}
```

## Files
- `frontend/warroom.js` — 4+ fetch wrappers with this pattern
