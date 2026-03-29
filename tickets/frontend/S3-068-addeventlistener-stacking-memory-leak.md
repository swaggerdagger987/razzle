---
id: S3-068
severity: S3
confidence: MEDIUM
category: performance
source: DQ-123
status: OPEN
---

# addEventListener stacking — listeners added without removal on re-render

## Root Cause

Multiple event listeners are added inside render functions that are called repeatedly (on filter change, pagination, sort). Each call adds new listeners without removing old ones, causing:
- Memory leak (listener count grows with each render)
- Duplicate handler execution (click fires 2x, 3x, etc.)

## Fix

Use event delegation on stable parent elements, or remove old listeners before adding new ones:
```js
el.removeEventListener('click', handler);
el.addEventListener('click', handler);
```

Or use `{ once: true }` where appropriate.

## Files

- `frontend/lab.js` — render functions that add listeners
- `frontend/lab-panels.js` — panel render functions

## Acceptance Criteria

- No duplicate event listeners after re-render
- Click handlers fire exactly once
