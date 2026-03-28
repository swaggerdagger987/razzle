---
id: S2-074
severity: S2
confidence: HIGH
category: reliability
source: DQ-498
status: OPEN
---

# 8 newer standalone pages have no AbortController timeout on fetch

## Root Cause

These 8 pages (Phases 131-140) use raw `fetch()` without AbortController or timeout. If the API is slow or down, the page shows a loading spinner indefinitely with no timeout or error recovery.

## Affected Pages

1. `frontend/drops.html`
2. `frontend/gamescript.html`
3. `frontend/seasonpace.html`
4. `frontend/snapefficiency.html`
5. `frontend/targetpremium.html`
6. `frontend/garbagetime.html`
7. `frontend/workload.html`
8. `frontend/successrate.html`

## Fix

Wrap each fetch with AbortController + 15s timeout:
```js
const ctrl = new AbortController();
const timeout = setTimeout(function() { ctrl.abort(); }, 15000);
fetch(url, { signal: ctrl.signal })
  .then(...)
  .catch(function(err) {
    if (err.name === 'AbortError') {
      container.innerHTML = razzleError('Request timed out. Try refreshing.');
    }
  })
  .finally(function() { clearTimeout(timeout); });
```

## Acceptance Criteria

- All 8 pages have 15s fetch timeout
- Timeout shows error message with refresh suggestion
- Loading indicator dismissed on timeout
