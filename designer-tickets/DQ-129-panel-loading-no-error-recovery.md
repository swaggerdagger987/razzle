# DQ-129: Lab panel loading states persist forever on API failure — no error recovery

**Priority**: P1 — HIGH
**Category**: UX / Error Handling
**Scope**: frontend/lab-panels.js

## Problem

When a Lab panel's API call fails (500, network error, CORS issue), the loading state ("pulling film...") stays visible indefinitely. There is no:
- Timeout that converts loading to error after N seconds
- Retry button for the user
- Error message explaining what happened

This is the direct UX consequence of DQ-121 (no .catch()) and DQ-122 (no timeout). But even if those are fixed, the loading UX needs explicit error recovery.

## User experience today

1. User clicks "Dynasty Rankings" panel in Lab sidebar
2. API is slow or fails (Render cold start, 502, etc.)
3. "pulling film..." appears
4. Nothing else happens. Ever.
5. User thinks the site is broken and leaves.

## Fix

Each panel load function should:

```js
var loadingTimer = setTimeout(function() {
  container.innerHTML = '<div class="error-state">' +
    '<p>this is taking longer than expected.</p>' +
    '<button onclick="loadPanelName()" class="btn-chunky">try again</button>' +
    '</div>';
}, 15000);

fetch(url)
  .then(function(r) { clearTimeout(loadingTimer); /* render */ })
  .catch(function(err) {
    clearTimeout(loadingTimer);
    container.innerHTML = '<div class="error-state">' +
      '<p>could not load data. ' + (err.name === 'AbortError' ? 'request timed out.' : 'check your connection.') + '</p>' +
      '<button onclick="loadPanelName()" class="btn-chunky">try again</button>' +
      '</div>';
  });
```

This gives users a retry path instead of a dead screen.
