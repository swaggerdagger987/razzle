---
id: DQ-324
title: 11 empty catch blocks silently swallow sync/analytics errors across 5 JS files
priority: P2
category: reliability
page: sitewide
---

## Problem
11 `.catch(function() {})` blocks across 5 frontend JS files silently swallow all errors. When sync operations fail (network down, 500, auth expired), Pro users get zero feedback — their data just doesn't sync.

**Instances found:**
1. `lab.js:358` — watchlist sync to server
2. `lab.js:4503` — saved views sync to server
3. `lab.js:6770` — (another sync)
4. `app.js:1409` — shared utility sync
5. `formulas.js:298` — formula sync
6. `formulas.js:314` — formula delete
7. `formulas.js:316` — formula sync
8. `player.js:757` — player data sync
9. `warroom.js:2751` — situation room sync
10. `warroom.js:3654` — situation room sync
11. `lab-panels.js:332` — panel sync

## Impact
- Pro users edit watchlist → sync fails silently → data lost on next session
- Pro users save views → sync fails silently → views lost on next session
- No way to detect or debug sync issues in production

## Expected
At minimum, log the error. Ideally, show a subtle toast: "changes saved locally, sync will retry."

## Fix
Replace each `.catch(function() {})` with:
```js
.catch(function(err) { console.warn("sync failed:", err.message); });
```

Or better: add a `_syncFailed` flag that shows a toast on next user action.

11 replacements across 5 files.

## Files
- `frontend/lab.js`
- `frontend/app.js`
- `frontend/formulas.js`
- `frontend/player.js`
- `frontend/warroom.js`
- `frontend/lab-panels.js`
