---
id: DQ-327
title: 12 standalone pages use raw fetch() instead of apiFetch() — missing auth headers
priority: P2
category: api-consistency
page: 12 standalone pages
---

## Problem
12 standalone HTML pages use raw `fetch()` to call backend APIs instead of the shared `apiFetch()` helper from app.js.

**Pages using raw fetch():**
1. drops.html
2. dualthreat.html
3. gamescript.html
4. garbagetime.html
5. league-intel.html
6. scarcity.html
7. seasonpace.html
8. snapefficiency.html
9. successrate.html
10. targetpremium.html
11. tdregression.html
12. workload.html

**What apiFetch() provides that raw fetch() misses:**
1. **Auth headers** — Pro users won't get Pro-tier responses on these pages
2. **Offline detection** — no "you're offline" message, just silent failure
3. **401 session handling** — expired tokens won't trigger re-auth
4. **API_BASE prefix** — will break if API_BASE changes from empty string

**Example (drops.html line 256):**
```js
const resp = await fetch(url);  // missing auth, offline check, API_BASE
```

**Correct pattern (used by 58+ other pages):**
```js
const data = await apiFetch('/api/endpoint');
```

## Expected
All 12 pages should use `apiFetch()` instead of raw `fetch()`.

## Fix
Replace `fetch(url)` with `apiFetch(path)` in each page's `loadData()` function. Since apiFetch returns parsed JSON directly, also remove the manual `.json()` call.

12 file changes, ~3 lines each.

## Files
- `frontend/drops.html`
- `frontend/dualthreat.html`
- `frontend/gamescript.html`
- `frontend/garbagetime.html`
- `frontend/league-intel.html`
- `frontend/scarcity.html`
- `frontend/seasonpace.html`
- `frontend/snapefficiency.html`
- `frontend/successrate.html`
- `frontend/targetpremium.html`
- `frontend/tdregression.html`
- `frontend/workload.html`
