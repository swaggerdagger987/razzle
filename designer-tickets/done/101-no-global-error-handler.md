# DES-101: No global window.onerror / unhandledrejection handler

**Priority**: P1
**Area**: frontend/app.js
**Cycle**: 10

## Problem

app.js has no `window.onerror` or `window.onunhandledrejection` handler. When a JavaScript error occurs outside of a try/catch block — or when a Promise rejects without a .catch() — the user sees nothing. The page silently breaks.

Specific scenarios where this matters:

1. **Network drops mid-session** — fetch calls in standalone pages that don't wrap every call in try/catch will throw unhandled rejections
2. **Third-party script errors** — if Stripe.js or any analytics script throws, it propagates silently
3. **Edge case JS errors** — null reference on unexpected API response shape, etc.

The existing `apiFetch()` and `razzleError()` patterns are good — they handle EXPECTED errors well. This ticket is about the UNEXPECTED ones that slip through.

## Fix

Add global error handlers in app.js (near the top, before other code runs):

```javascript
window.onerror = function(message, source, lineno, colno, error) {
  if (typeof _showToast === 'function') {
    _showToast(typeof razzleError === 'function' ? razzleError() : 'something went sideways. try refreshing.');
  }
  // Don't suppress — let it still log to console for debugging
  return false;
};

window.onunhandledrejection = function(event) {
  if (typeof _showToast === 'function') {
    _showToast(typeof razzleError === 'function' ? razzleError() : 'something went sideways. try refreshing.');
  }
};
```

### Guard rails
- Use `razzleError()` for agent-voiced messages (already exists, picks random from RAZZLE_ERRORS)
- `return false` from onerror so the error still logs to console (debugging)
- Don't fire toast on every error in a burst — debounce to max 1 toast per 5 seconds
- Don't catch errors from third-party origins (check `source` for same-origin)

## Why This Matters

A first-time visitor from Reddit who hits a silent JS error sees a frozen page. They leave. They don't come back. A Razzle-voiced toast ("film room went dark. check your connection and give it another shot") at least tells them something happened and suggests retry. That's the difference between a bounce and a return visit.
