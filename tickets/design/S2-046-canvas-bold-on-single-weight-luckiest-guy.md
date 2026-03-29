# S2-046: Canvas applies "bold" to single-weight Luckiest Guy font (38 instances)

**Severity**: S2 (Medium)
**Category**: design
**Source**: designer-tickets/DQ-021
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

Luckiest Guy is a display font with only ONE weight (400). Applying `bold` in canvas `ctx.font` has no visual effect and may cause browsers to synthesize a faux-bold, resulting in muddy/thickened rendering.

38 instances across 4 JS files:
- `frontend/lab.js` — 36 instances (lines 5984, 6284, 7135, 7142, 7166, 7223, 7883, 7901, 7950, 8108, 8120, 8269, 8354, 8367, 8631, 8683, 9012, 9127, 9484, 9849, 10080, 10443, 11173, 11289, 11381, 12030, 12049, 12055, 12234, 12553, 12605, 12612, 12621, 13042, 13050, 13072, 13097, +more)
- `frontend/player.js` — 3 instances (lines 595, 601, 625)
- `frontend/compare.js` — 4 instances (lines 614, 718, 724, 769)
- `frontend/charts.js` — 3 instances (lines 579, 676, 1098)

Example pattern:
```javascript
ctx.font = "bold 16px 'Luckiest Guy', cursive";
// should be:
ctx.font = "16px 'Luckiest Guy', cursive";
```

## Fix

Find-replace across all 4 files: remove `bold ` prefix from all Luckiest Guy font strings.
```
"bold NNpx 'Luckiest Guy'" → "NNpx 'Luckiest Guy'"
```

## Files to Change

- `frontend/lab.js` (36 instances)
- `frontend/player.js` (3 instances)
- `frontend/compare.js` (4 instances)
- `frontend/charts.js` (3 instances)

## Accept When

1. `grep -r "bold.*Luckiest" frontend/` returns zero results
2. Canvas text renders same visual weight (Luckiest Guy is already bold by design)
