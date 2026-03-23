---
id: DQ-264
title: charts.js and lab.js canvases are blurry on retina displays — missing devicePixelRatio scaling
priority: P1
category: visual-quality
status: open
cycle: 36
---

## Problem

The shared charting module (`charts.js`) and Lab canvas code (`lab.js`) draw all canvases at 1x resolution regardless of display density. On retina/HiDPI screens (2x, 3x), all chart text and lines appear blurry. This affects radar charts, scatter plots, heatmaps, sparklines, and comparison canvases — the most screenshot-worthy parts of the site.

Standalone pages like `aging.html` and `career.html` already handle DPR correctly. The shared modules do not.

## Evidence

`grep -r "devicePixelRatio" frontend/charts.js` → **0 results**
`grep -r "devicePixelRatio" frontend/lab.js` → **0 results**

Compare to aging.html (correct):
```javascript
var dpr = window.devicePixelRatio || 1;
canvas.width = w * dpr;
canvas.height = h * dpr;
ctx.scale(dpr, dpr);
```

charts.js draws 9-10px text on canvas without DPR scaling:
```javascript
ctx.font = "bold 9px 'Space Mono', monospace";  // blurry at 2x
ctx.font = "bold 10px 'Space Mono', monospace";
```

## Fix

Add DPR-aware canvas setup to `charts.js` (shared by all chart types):
```javascript
var dpr = window.devicePixelRatio || 1;
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
canvas.style.width = rect.width + 'px';
canvas.style.height = rect.height + 'px';
ctx.scale(dpr, dpr);
```

Apply the same pattern in lab.js wherever canvases are created.

## Files
- `frontend/charts.js` — add DPR scaling to canvas init
- `frontend/lab.js` — add DPR scaling to all canvas creation

## Impact
Every chart on the site looks blurry to retina users (majority of Mac, iPhone, modern Windows laptops). This is the #1 visual quality issue for screenshots — the exact thing that gets shared on Reddit.
