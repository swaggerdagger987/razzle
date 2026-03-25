---
id: DQ-498
title: 8 newer standalone panel pages have no AbortController timeout on fetch
severity: P2
status: open
component: Standalone Pages
phase: Phases 131-140
---

## Problem

Eight panel pages built in Phases 131-140 call `fetch()` with no AbortController, no signal, and no timeout. If the API hangs or the network is slow, the page shows "pulling film..." forever with no recovery path.

DQ-122 covers "fetch-no-timeout-110-infinite-hangs" sitewide, but was filed before these 8 pages were built. These are new instances of the pattern. The pages DO have proper `.catch()` error handling (they call `razzleError()`), but a hanging request never triggers the catch.

## Affected Pages

1. `frontend/drops.html` — `fetch("/api/drop-rate?...")` line 256
2. `frontend/gamescript.html` — `fetch("/api/game-script?...")`
3. `frontend/seasonpace.html` — `fetch("/api/season-pace?...")`
4. `frontend/snapefficiency.html` — `fetch("/api/snap-efficiency?...")`
5. `frontend/targetpremium.html` — `fetch("/api/target-premium?...")`
6. `frontend/garbagetime.html` — `fetch("/api/garbage-time?...")`
7. `frontend/workload.html` — `fetch("/api/workload-monitor?...")`
8. `frontend/successrate.html` — `fetch("/api/success-rate?...")`

## Fix

Add 15-second timeout via AbortController:

```js
const ctrl = new AbortController();
const timer = setTimeout(() => ctrl.abort(), 15000);
try {
  const resp = await fetch(url, { signal: ctrl.signal });
  clearTimeout(timer);
  // ... handle response
} catch (e) {
  clearTimeout(timer);
  document.getElementById("XX-loading").textContent = razzleError();
}
```

## Acceptance Criteria

- [ ] All 8 pages use AbortController with 15s timeout
- [ ] Timeout triggers error state (not infinite loading)
- [ ] Timer is cleared on successful response
