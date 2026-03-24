---
id: DQ-455
priority: P2
category: incomplete-fix-verification
status: open
cycle: 58
---

# DQ-455: Done ticket DES-090 incomplete — 19 dynamically created canvas elements still lack role="img" + aria-label

## Problem

Ticket DES-090 added `role="img"` and `aria-label` to canvas elements for WCAG compliance. Static `<canvas>` elements in HTML templates were fixed. **Dynamically created canvases via `document.createElement("canvas")` in JavaScript were NOT fixed.**

19 instances across 4 files create canvas elements with zero accessibility attributes.

## Evidence

Files with `createElement("canvas")` missing aria attributes:
- `frontend/lab-panels.js` — ~12 instances (aging curves, heatmaps, sparklines, scatter plots)
- `frontend/charts.js` — ~4 instances (radar, compare, trend, export)
- `frontend/lab.js` — ~2 instances (PNG export canvas)
- `frontend/league-intel.html` — ~1 instance (inline script canvas)

Pattern:
```javascript
const canvas = document.createElement("canvas");
canvas.width = 400;
canvas.height = 300;
// Missing: canvas.setAttribute("role", "img");
// Missing: canvas.setAttribute("aria-label", "descriptive text");
```

## Fix

After every `createElement("canvas")`, add:
```javascript
canvas.setAttribute("role", "img");
canvas.setAttribute("aria-label", "[chart type] for [context]");
```

Example labels:
- "Aging curve chart showing PPG by age for quarterbacks"
- "Radar chart comparing player stats"
- "Weekly scoring heatmap"
- "Scatter plot of stat explorer"

## Why It Matters

Screen readers announce these canvases as empty decorative elements. Users who rely on assistive technology get zero information about 19 data visualizations.

## Verification

```bash
grep -n "createElement.*canvas" frontend/lab-panels.js frontend/charts.js frontend/lab.js
# Each match should have setAttribute("role", "img") within 3 lines
```
