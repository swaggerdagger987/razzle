# DES-118: No retry button when API calls fail

**Priority:** P1 — Conversion / UX
**Component:** app.js, lab.js, lab-panels.js
**Affects:** Every API-dependent view (screener, panels, player profiles, compare, trade analyzer)

## Problem

When an API call fails, the UI shows an agent-voiced error toast ("fumbled the data fetch... try again") that auto-dismisses after 2.5 seconds. The user sees "try again" as text — but there's no clickable retry button. They have to know to manually re-trigger their search or reload the page.

This is a conversion blocker: a first-time visitor from Reddit who hits a Render cold-start timeout sees an error flash for 2.5 seconds and then... nothing. Previous table data is preserved (good), but there's no obvious path forward.

## Evidence

- `app.js:392-395` — error messages say "try again" as plain text
- `app.js:528-545` — `apiFetch()` throws immediately on error, no retry logic
- `lab.js:1353-1360` — screener catch block shows toast, no retry button
- `lab-panels.js:159-160` — panel catch blocks show inline error, no retry button
- `compare.js:70-76` — compare page shows "Back to Screener" link (good escape, but no retry)

## Fix

1. Add a "Retry" button to error toasts for fetch failures:
   ```javascript
   _showToast('fumbled the data fetch...', 'error', 0, { text: 'Retry', action: lastAction });
   ```
   Toast should NOT auto-dismiss when it has a retry action.

2. For inline panel errors (`<div class="lp-error">`), add a retry button:
   ```html
   <div class="lp-error">
     Film room offline.
     <button onclick="retryLastFetch()" class="btn-chunky" style="margin-top:8px;">Try again</button>
   </div>
   ```

3. Store the last fetch function reference so retry can re-invoke it.

## Why it matters

Reddit/Twitter traffic hits the site cold. Render cold starts can take 5-10 seconds. If the first API call times out and the user sees an error with no recovery path, they leave. One retry button is the difference between a bounce and a conversion.
