---
id: DQ-471
title: warroom.js HUD state indicator dots use 7 off-palette bright colors
priority: P2
category: color-tokens
status: open
cycle: 60
---

## Problem

The Situation Room HUD shows a colored dot next to each agent indicating their AI state (idle, walking, working, thinking, etc.). These 7 dot colors are custom hex values that don't match any color in the Razzle design palette.

DQ-416 covers cold gray hex values (#333, #666, #ccc) in warroom.js. This ticket covers the BRIGHT STATE COLORS which are a different issue — they're non-gray custom hex that should map to Razzle accent colors.

## Evidence

`frontend/warroom.js` lines 1251-1257:

| Line | Current | State | Palette Equivalent |
|------|---------|-------|--------------------|
| 1251 | `#666` | IDLE | `var(--ink-light)` / `#8a7565` |
| 1252 | `#33cc55` | WALK | `var(--green)` / `#2ec4b6` |
| 1253 | `#3388cc` | WORK_DESK/ANALYZE | `var(--blue)` / `#5b7fff` |
| 1254 | `#ccaa33` | THINK | `var(--yellow)` / `#ffc857` |
| 1255 | `#cc6633` | DISCUSS | `var(--orange)` / `#d97757` |
| 1256 | `#cc3333` | CELEBRATE | `var(--green)` / `#2ec4b6` (celebration = positive) |
| 1257 | `#8B6914` | COFFEE | `#8a7565` (warm brown) |

Also line 1260: unselected agent label text uses `#ccc` (covered by DQ-416, noted here for context).

## Fix

Replace each custom hex with the closest Razzle palette color. Canvas can't use CSS vars directly, so hardcode the palette hex values from DESIGN.md:

```javascript
let dotColor = '#8a7565'; // idle → ink-light
if (a.state === STATE.WALK) dotColor = '#2ec4b6'; // green
else if (a.state === STATE.WORK_DESK || a.state === STATE.ANALYZE_BOARD) dotColor = '#5b7fff'; // blue
else if (a.state === STATE.THINK) dotColor = '#ffc857'; // yellow
else if (a.state === STATE.DISCUSS) dotColor = '#d97757'; // orange
else if (a.state === STATE.CELEBRATE) dotColor = '#2ec4b6'; // green (positive)
else if (a.state === STATE.COFFEE) dotColor = '#8a7565'; // warm brown
```

## Files
- `frontend/warroom.js` lines 1251-1257
