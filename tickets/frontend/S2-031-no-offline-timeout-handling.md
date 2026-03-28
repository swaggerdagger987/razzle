---
id: S2-031
severity: S2
category: frontend
title: No global fetch timeout or offline detection — pages show "pulling film..." indefinitely
source: deep-audit
status: open
---

## Problem

All pages depend on API calls. If the API is slow or offline, users see "pulling film..." indefinitely with no timeout or offline detection. There is no service worker for caching. During peak traffic (Sunday NFL games), API latency could make pages appear broken.

## Root Cause

Lab.js HAS comprehensive timeout handling (`frontend/lab.js:1295` — `AbortSignal.timeout(15000)` plus 7 AbortControllers). But standalone panel pages and app.js do NOT have equivalent timeouts.

- `frontend/lab.js:1295` — 15s timeout (good)
- `frontend/league-intel.html` — AbortController with 10s timeout (good)
- **64 standalone panel pages** — NO timeout on fetch calls
- `frontend/app.js` — NO global timeout wrapper
- No offline detection (`navigator.onLine`) anywhere

## Fix

1. Add a global fetch wrapper or interceptor with a 15-second timeout
2. After timeout, transition loading state to an error state with a "Retry" button
3. Optionally detect `navigator.onLine === false` and show "You're offline" immediately

## Accept When

- No page shows loading state indefinitely (15s max before error state)
- Error state includes a "Retry" button
- User sees a clear message if they are offline
