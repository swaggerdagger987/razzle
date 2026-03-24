---
id: DES-444
priority: P2
area: error recovery
section: standalone panels
type: incomplete-fix
status: open
---

# 5+ standalone panels still lack retry button (DQ-118 incomplete)

## What's wrong

DQ-118 added retry buttons to screener error toasts. But several standalone panel pages show razzleError() text with NO retry button, while others (weekly, targets, matchups) DO have retry buttons. Inconsistency within the same product surface.

## Where

**Has retry button:**
- `frontend/weekly.html:466` — `<button class="btn-chunky" onclick="location.reload()">retry</button>`
- `frontend/targets.html:463` — same pattern
- `frontend/matchups.html:532` — `<button class="matchups-retry-btn" onclick="location.reload()">retry</button>`

**Missing retry button:**
- `frontend/breakouts.html:548` — `razzleError()` text only, no button
- `frontend/aging.html:745` — `razzleError()` text only, no button
- `frontend/buysell.html` — error state, no retry
- `frontend/scarcity.html` — error state, no retry
- `frontend/yoy.html` — error state, no retry

## Fix

Add retry button to all standalone panel error states:
```javascript
bodyEl.innerHTML = '<div class="panel-error">' + razzleError() +
  '<button class="btn-chunky" onclick="location.reload()" style="margin-top:12px;">retry</button></div>';
```

## Why it matters

A user who hits an error on aging.html has to manually reload the page. A user on weekly.html gets a retry button. Same product, different experience. Retry buttons are the #1 error recovery affordance.
