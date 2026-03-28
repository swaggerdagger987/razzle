---
id: S2-064
severity: S2
confidence: HIGH
category: reliability
source: DQ-324
status: OPEN
---

# 11 empty catch blocks silently swallow sync errors across 5 JS files

## Root Cause

11 `.catch(function() {})` blocks across 5 frontend files silently swallow all errors. When sync operations fail (network down, 500, auth expired), Pro users get zero feedback — data doesn't sync and they never know.

## Instances

1. `frontend/lab.js:358` — watchlist sync to server
2. `frontend/lab.js:4503` — saved views sync to server
3. `frontend/lab.js:6770` — another sync
4. `frontend/app.js:1409` — shared utility sync
5. `frontend/formulas.js:298` — formula sync
6. `frontend/formulas.js:314` — formula delete
7. `frontend/formulas.js:316` — formula sync
8. `frontend/player.js:757` — player data sync
9. `frontend/warroom.js:2751` — situation room sync
10. `frontend/warroom.js:3654` — situation room sync
11. `frontend/lab-panels.js:332` — panel sync

## Fix

Replace each `.catch(function() {})` with:
```js
.catch(function(err) { console.warn("sync failed:", err.message); });
```

11 replacements across 5 files. One-line change each.

## Acceptance Criteria

- All 11 empty catch blocks log the error at minimum
- No silent data loss on sync failure
