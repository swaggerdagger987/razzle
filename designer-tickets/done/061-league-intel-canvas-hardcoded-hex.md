# DES-061: league-intel.html canvas uses hardcoded hex position colors

**Priority**: P2
**Area**: frontend/league-intel.html (Bureau canvas charts)
**Cycle**: 6

## Problem

Bureau canvas-drawn charts (radar charts, distribution bars) use hardcoded hex colors instead of reading from CSS variables or `getCanvasTheme()`. This means:
1. Dark mode users see colors designed for light backgrounds
2. Position colors are hardcoded instead of referencing the design system
3. If position colors ever change in DESIGN.md, these won't update

## Instances Found

| Line | Usage | Current Value |
|------|-------|---------------|
| 5693 | Position colors array | `["#5b7fff", "#2ec4b6", "#d97757", "#8b5cf6"]` |
| 5735 | Polygon stroke | `"#d97757"` |
| 5733 | Polygon fill | `"rgba(217, 119, 87, 0.2)"` |
| 6309 | Bar fill colors | `'#2ec4b6'`, `'#d97757'`, `'#c4b5a4'` |
| 5692 | Theme fallback | `{ink:'#2d1f14',inkFaint:'#c4b5a5',inkMedium:'#6d5c4e'}` |
| 6311 | Theme fallback | `{ink:'#2d1f14',inkMedium:'#6d5c4e'}` |

## Fix

1. Read position colors from CSS variables using `getComputedStyle()`:
   ```javascript
   var style = getComputedStyle(document.documentElement);
   var colors = [
     style.getPropertyValue('--pos-qb').trim(),
     style.getPropertyValue('--pos-rb').trim(),
     style.getPropertyValue('--pos-wr').trim(),
     style.getPropertyValue('--pos-te').trim()
   ];
   ```
2. Use `getCanvasTheme()` which already exists in app.js — remove fallback objects
3. Replace `rgba(217, 119, 87, 0.2)` with computed orange + alpha

## Design Rule

Canvas exports should use `getCanvasTheme()` pattern (already used correctly in app.js, compare.js, charts.js). Bureau charts are the outlier.
