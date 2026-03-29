---
id: S2-010
severity: S2
category: performance
title: "Offline/slow-network handling partially implemented — no service worker"
status: open
audit: DEEP-AUDIT-TICKETS.md
---

# S2-010: No offline/slow-network handling

## Finding

The deep audit says pages depend on API calls with no timeout or offline detection.

## Root Cause Investigation

**Status: Partially implemented. No service worker.**

**File: `frontend/app.js:671-672`** — Offline event listener:
```javascript
window.addEventListener('offline', function() {
  _showToast('You appear to be offline. Reconnect to keep exploring.', 'warning', 0);
});
```

**File: `frontend/app.js:688`** — Global offline check in apiFetch:
```javascript
if (!navigator.onLine) throw new Error("You're offline — check your connection.");
```

**File: `frontend/app.js:693-695`** — Global 15-second fetch timeout:
```javascript
if (!options.signal) {
  options.signal = AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined;
}
```

**What exists**: Offline detection, offline toast notification, 15-second global fetch timeout.
**What's missing**: Service worker for static asset caching, retry button on timeout errors, cached data fallback.

## Assessment

The basics are covered (offline detection + timeout). A service worker would be a nice-to-have for peak traffic resilience but isn't critical.

## Acceptance Criteria

- [x] Offline detection and notification implemented
- [x] Global 15-second fetch timeout implemented
- [ ] Consider service worker for static asset caching (optional)
- [ ] Consider retry button when fetch times out (optional)
