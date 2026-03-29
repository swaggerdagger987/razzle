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

## Root Cause

**File**: `frontend/lab.js` ~lines 2105-2150

The `loadSparklines()` function:
1. Aborts the previous request via `_sparklineAbort` (good)
2. Fires a new POST to `/api/screener/sparklines`
3. On success, writes `_sparklineCache[pid] = sp[pid]` unconditionally

The abort controller handles the case where the old request hasn't completed. But if the old request completes BETWEEN the abort signal being set and the browser actually aborting (race window), or if the abort doesn't propagate fast enough, the old data can overwrite the cache.

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
