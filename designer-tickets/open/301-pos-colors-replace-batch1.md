<!-- PM: ready -->
---
id: DQ-360b
parent: 360 (POS_COLORS Duplicate Inline)
priority: P3
area: 5 standalone HTML pages
section: inline JavaScript
type: DRY / maintainability
status: open
depends_on: DQ-360a
---

# Replace inline POS_COLORS declarations in batch 1 (5 pages)

**Files**: `frontend/workload.html`, `frontend/targetpremium.html`, `frontend/seasonpace.html`, `frontend/garbagetime.html`, `frontend/snapefficiency.html`

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

## Accept when

- No inline `getPropertyValue("--pos-qb")` blocks remain in these 5 files
- Position colors still render correctly on each page
- Each page loads app.js before its own script

## Depends on

DQ-360a (shared function must exist first)
