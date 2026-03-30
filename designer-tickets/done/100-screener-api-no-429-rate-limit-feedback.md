<!-- PM: ready -->
---
id: DQ-439
priority: P1
area: frontend/lab.js
section: error handling / UX
type: missing error differentiation
status: open
cycle: 56
---

# Screener API fetch has no 429 rate limit handling — generic error shown

## What's wrong

When the screener API returns 429 (rate limited), lab.js shows a generic error toast. It doesn't:
1. Tell the user they've been rate limited
2. Suggest waiting before retrying
3. Show how long to wait (if Retry-After header is present)

The Situation Room (warroom.js:2431, 2688-2695) handles 429 correctly with specific messaging and query limit tracking. The main screener does not.

## Where

- `frontend/lab.js:1265-1281` — `fetchAndRender()` fetch error handling
- Compare with `frontend/warroom.js:2431` — proper 429 handling pattern

## Fix

In the fetch error handler in `fetchAndRender()`, add 429 detection:
```js
if (resp.status === 429) {
  var retryAfter = resp.headers.get('Retry-After');
  var waitMsg = retryAfter ? ' Try again in ' + retryAfter + 's.' : ' Wait a moment and try again.';
  _showToast('Slow down — too many requests.' + waitMsg, 'warning', 5000);
  return;
}
```

## Not a duplicate of

- No existing ticket covers 429 handling in the screener specifically
- DQ-122 covers fetch timeout (no response), not rate limiting (429 response)

## Why this matters

Rate limiting is more likely during peak usage (Sunday game time). Users hitting 429 see a vague "something went wrong" instead of a clear "wait 10 seconds." This causes panic-refreshing which makes the rate limiting worse.
