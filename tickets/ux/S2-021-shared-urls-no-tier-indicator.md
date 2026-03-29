---
id: S2-021
severity: S2
category: ux-flow
finding_ref: EDGE-45
confidence: MEDIUM
---

# S2-021: Shared screener URLs show different data based on recipient's tier

## Root Cause

`frontend/lab.js:4102`:
```javascript
if (params.has("cols")) state.visibleColumns = params.get("cols").split(",")
  .filter(function(k) { return COLUMNS[k]; });
```

`frontend/lab.js:1589-1591` — Tier-locked columns show lock icons:
```javascript
const lockCls = _getTierLockClass(key);
const tierLabel = lockCls === "elite-locked" ? " [Elite]" : lockCls === "pro-locked" ? " [Pro]" : "";
```

When a Pro user shares a screener URL containing Pro-only columns (e.g., `?cols=ppg,target_share,wopr`),
a Free user opening that URL sees those columns but with locked/empty cells. There is no
indicator explaining why data is missing or that the URL was created by a higher-tier user.

## What to Fix

When restoring URL state that includes tier-locked columns, show a one-time toast:

```javascript
// After restoring URL state in _restoreFromURL():
const lockedCols = state.visibleColumns.filter(k => _getTierLockClass(k));
if (lockedCols.length > 0) {
  _showToast(lockedCols.length + ' columns in this view require Pro — upgrade to see full data', 'info');
}
```

## Files to Change

- `frontend/lab.js` — Add tier-awareness check after URL state restoration

## Acceptance Criteria

- [ ] When a free user opens a shared URL with Pro/Elite columns, a toast explains locked columns
- [ ] Toast shown once per URL load (not on every render)
- [ ] Toast uses brand voice and links to pricing
- [ ] Pro/Elite users see no toast (all columns accessible)

## Do NOT

- Do not strip locked columns from the URL (preserve the sharer's intent)
- Do not block the page load — show toast non-intrusively
