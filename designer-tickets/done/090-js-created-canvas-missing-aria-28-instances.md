# DES-090: 28+ JS-created canvas elements missing role="img" + aria-label

**Priority**: P1
**Area**: frontend/lab.js (14), frontend/lab-panels.js (10), frontend/charts.js (2), frontend/compare.js (2), frontend/player.js (2)
**Cycle**: 9

## Problem

Twenty-eight or more canvas elements created via `document.createElement("canvas")` in JavaScript have no `role="img"` or `aria-label`. Screen readers skip them entirely — users who rely on assistive technology get no indication that a chart, graph, or visualization exists.

### Breakdown by file

**lab.js** (14 instances — lines 5660, 6110, 6948, 7676, 8075, 8422, 8832, 9306, 9743, 10048, 10265, 10969, 11825, 12352):
- Trade Analyzer charts, aging curves, heatmaps, scatter plots, radar charts, PNG export canvases

**lab-panels.js** (10 instances):
- Panel-specific charts (breakout charts, usage sparklines, efficiency scatter, etc.)

**charts.js** (2 instances — lines 1040, 1471):
- Chart rendering and export canvases

**compare.js** (2 instances — line 592):
- Compare radar chart and PNG export canvas

**player.js** (2 instances — line 569):
- Player profile charts

### Correctly attributed canvases (DO NOT CHANGE)

Static canvases in `lab.html` are correctly done:
```html
<canvas id="chartCanvas" role="img" aria-label="Player statistics chart" ...>
<canvas id="compareRadar" role="img" aria-label="Player comparison radar chart" ...>
```

## Fix

After each `createElement("canvas")`, add:

```javascript
canvas.setAttribute("role", "img");
canvas.setAttribute("aria-label", "Descriptive label for this chart");
```

Labels should describe what the chart shows, e.g.:
- "Trade analyzer value comparison chart"
- "Player aging curve by position"
- "Fantasy points per game scatter plot"

For PNG export canvases (off-screen rendering only, never displayed in DOM), ARIA attributes are unnecessary — skip those.

## Design Rule

WCAG 2.1 SC 1.1.1: Non-text Content. Canvas elements must have text alternatives. The existing codebase pattern (lab.html static canvases) uses `role="img"` with descriptive `aria-label`.
