# DQ-278: 4 newer standalone pages hardcode empty state instead of razzleEmpty()

**Priority**: P3 — Pattern consistency
**Category**: Cross-page Consistency
**Severity**: LOW — Functional but breaks established pattern

## Problem

The 4 newest standalone pages use ad-hoc hardcoded empty state messages instead of the standardized `razzleEmpty()` helper function that other pages use:

| Page | Line | Current |
|------|------|---------|
| workload.html | 268 | `'<div class="wl-empty">no workload data found for this filter</div>'` |
| targetpremium.html | 268 | `'<div class="tp-empty">no target premium data found</div>'` |
| snapefficiency.html | 269 | `'<div class="se-empty">no snap efficiency data found</div>'` |
| dualthreat.html | 271 | `'<div class="dt-empty">no dual-threat data found</div>'` |

Compare to seasonpace.html and garbagetime.html which use the standardized helper.

## Fix

Replace each hardcoded string with the razzleEmpty() helper (or create personality messages):
```javascript
wrap.innerHTML = '<div class="wl-empty">' + razzleEmpty("workload") + '</div>';
```

Or at minimum, use personality text: "no film on this crew yet" instead of generic "no data found."

## Files
- `frontend/workload.html` line 268
- `frontend/targetpremium.html` line 268
- `frontend/snapefficiency.html` line 269
- `frontend/dualthreat.html` line 271
