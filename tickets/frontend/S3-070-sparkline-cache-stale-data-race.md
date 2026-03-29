---
id: S3-070
severity: S3
confidence: MEDIUM
category: reliability
status: OPEN
created: 2026-03-29
source: fresh-investigation-batch-12
---

# S3-070: Sparkline cache can serve stale data on rapid filter changes

## Problem

When a user rapidly changes filters or scrolls, multiple sparkline fetch requests fire. If an earlier request resolves AFTER a later one (due to network jitter), the sparkline cache `_sparklineCache` is updated with stale data that overwrites fresh data.

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

### Cache structure
- `lab.js:2104` — `let _sparklineCache = {};  // pid -> [pts...]`
- `lab.js:2105` — `let _sparklineAbort = null;`

### Cache population
- `lab.js:2107-2150` — `loadScreenerSparklines()`:
  - Line 2116-2117: Previous fetch aborted, new AbortController created
  - Line 2120-2124: **Cache key is season-only**: `cacheKey = ${season}` — does NOT include filters, sort, or search
  - Line 2125: Only fetches IDs not already in cache
  - Line 2142: Writes to cache: `_sparklineCache[pid] = sp[pid]`

### Missing invalidation (the real bug)
- `lab.js:3292-3303` — Filter changes → `fetchAndRender()` but **cache NOT cleared**
- `lab.js:2972-2982` — Sort changes → `fetchAndRender()` but **cache NOT cleared**
- `lab.js:3016-3022` — Position changes → cache NOT cleared

The sparkline cache persists across different filtered/sorted datasets within the same season. A player cached from one filter context is reused in another without refetching.

### Stale DOM access
- `lab.js:2152-2163` — `injectSparklines()` queries DOM for `.sparkline-cell[data-sparkline-pid]`
- `lab.js:2237` — Hover card reads `_sparklineCache[playerId]` without verifying current dataset
- `lab.js:4783-4784` — Pinned rows inject from stale cache
- `lab.js:2013-2014` — Virtual scroll re-injects from stale cache

## Fix

Add a request generation counter:
```javascript
var _sparklineGen = 0;

function loadSparklines() {
  var gen = ++_sparklineGen;
  // ... fetch ...
  .then(function(data) {
    if (gen !== _sparklineGen) return; // stale response, ignore
    // ... update cache ...
  });
}
```

## Acceptance Criteria

- [ ] Rapid filter changes don't cause sparkline data to show for wrong filter context
- [ ] No visual regressions on sparkline rendering

## Do NOT Touch

- The sparkline rendering logic itself
- The abort controller pattern (keep it for cancellation, add generation check on top)
