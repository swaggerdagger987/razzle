# DES-150: No fetch timeout on Screener API calls — silent hang on slow networks

**Priority**: P2
**Category**: Resilience / UX
**Affects**: lab.js `fetchAndRenderNFL()` — every Screener query
**Cycle**: 14

## Problem

The Screener's primary data fetch (`/api/screener/query`) uses `AbortController` for race condition prevention but configures NO timeout. On slow mobile networks (common for Twitter/Reddit traffic — 62% mobile per GTM report), a hung request shows the skeleton loading animation indefinitely with "pulling film..." and no feedback that something is wrong.

## Evidence

`lab.js:1267-1290`: The `fetchAndRenderNFL()` function creates an AbortController for aborting duplicate requests, but never sets `AbortSignal.timeout()`. The only timeout in the entire frontend is in `league-intel.html:2168` (10s for user ID fetch).

Browser default timeout is 5-15 minutes depending on browser. A user on a slow network stares at "pulling film..." for minutes before seeing an error.

## Fix

Add `AbortSignal.timeout(15000)` (15 seconds) to the screener fetch. After timeout, show the existing error toast with retry button. This is a one-line addition to the fetch options:

```javascript
var signal = AbortSignal.any([_abortCtrl.signal, AbortSignal.timeout(15000)]);
```

Or for broader browser support, use a setTimeout that aborts after 15s.

## Why it matters

A first-time Reddit visitor on mobile who hits a slow API call sees an infinite skeleton. No feedback = bounce. A 15s timeout with a retry button is dramatically better than a silent hang. The skeleton is well-designed — it just needs a ceiling.
