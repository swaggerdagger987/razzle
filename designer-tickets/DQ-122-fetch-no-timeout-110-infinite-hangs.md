# DQ-122: 110+ frontend fetch calls have no AbortController — slow APIs cause infinite loading

**Priority**: P1 — HIGH
**Category**: Robustness / Performance
**Scope**: 8 frontend JS files

## Problem

110+ fetch() calls have no AbortController or timeout mechanism. If an API endpoint is slow (Render cold start, DB lock, network congestion), the fetch hangs indefinitely. The user sees "pulling film..." forever with no way to cancel or retry.

## Counts by file

| File | Unprotected fetches | Protected (has signal) |
|------|--------------------|-----------------------|
| lab-panels.js | 72 | 0 |
| app.js | 11 | 0 |
| lab.js | 5 | 2 |
| warroom.js | 9 | 5 |
| formulas.js | 5 | 0 |
| formula-store.js | 5 | 0 |
| compare.js | 2 | 0 |
| player.js | 1 | 0 |

Only lab.js and warroom.js use AbortController at all. lab-panels.js (the biggest file, 72 fetches) has zero.

## Fix

Create a shared fetchWithTimeout helper in app.js:

```js
function fetchWithTimeout(url, options, timeoutMs) {
  timeoutMs = timeoutMs || 15000;
  var controller = new AbortController();
  var timer = setTimeout(function() { controller.abort(); }, timeoutMs);
  options = options || {};
  options.signal = controller.signal;
  return fetch(url, options).finally(function() { clearTimeout(timer); });
}
```

Then replace `fetch(url)` with `fetchWithTimeout(url)` across all files. 15s default timeout, with 20s for LLM calls in warroom.js.
