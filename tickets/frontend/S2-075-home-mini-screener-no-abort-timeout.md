---
id: S2-075
severity: S2
confidence: HIGH
category: reliability
source: DQ-339
status: OPEN
---

# Home mini-screener fetch has no AbortController or timeout

## Root Cause

`frontend/index.html:1047-1065`:

```js
fetch('/api/players?limit=60&sort=fantasy_points_ppr&order=desc&min_games=8')
  .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(...)
  .catch(...)
```

No AbortController, no timeout, no cancellation. If the API is slow, the home page mini-screener shows a loading state indefinitely. This is the first thing users see.

## Fix

Add AbortController with 10s timeout:
```js
const ctrl = new AbortController();
const t = setTimeout(function() { ctrl.abort(); }, 10000);
fetch(url, { signal: ctrl.signal })
  .finally(function() { clearTimeout(t); });
```

## Files

- `frontend/index.html:1047-1065` — mini-screener fetch

## Acceptance Criteria

- Mini-screener fetch has 10s timeout
- Timeout shows graceful fallback (hide mini-screener section or show placeholder)
