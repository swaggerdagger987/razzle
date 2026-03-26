<!-- PM: ready -->
---
id: DQ-360c
parent: 360 (POS_COLORS Duplicate Inline)
priority: P3
area: 5 standalone HTML pages
section: inline JavaScript
type: DRY / maintainability
status: open
pm_note: DQ-360a was never ticketed but getPosColors() already ships in app.js — unblocked
---

# Replace inline POS_COLORS declarations in batch 2 (5 pages)

**Files**: `frontend/dualthreat.html`, `frontend/tdregression.html`, `frontend/advantage.html`, `frontend/weeklymvp.html`, `frontend/weeklyleaders.html`

## What to do

In each file, find the 6-line POS_COLORS block:
```javascript
const _cs = getComputedStyle(document.documentElement);
const POS_COLORS = {
  QB: _cs.getPropertyValue("--pos-qb").trim() || "#5b7fff",
  ...
};
```

Replace with:
```javascript
const POS_COLORS = getPosColors();
```

Final sweep: `grep -rn 'getPropertyValue.*--pos-qb' frontend/*.html` should return 0 matches (excluding app.js).

## Accept when

- Zero inline POS_COLORS blocks remain in any standalone HTML page
- Position colors still render correctly
- Each page loads app.js before its own script

## Root cause

Parent epic DQ-360. Shared `getPosColors()` already exists in `app.js`.
