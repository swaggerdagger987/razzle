# DES-091: 10+ HTML template canvas elements missing role="img" + aria-label

**Priority**: P2
**Area**: 7 standalone HTML pages + 3 league-intel.html creation points
**Cycle**: 9

## Problem

Canvas elements in HTML templates and JS-generated innerHTML lack `role="img"` and `aria-label`. Screen readers skip these charts entirely.

### Standalone HTML pages (7 pages, dynamically generated via innerHTML)

| Page | Canvas ID pattern | What it shows |
|------|------------------|---------------|
| `aging.html` (line 702) | `chart-{pos}` | PPG-by-age curves per position |
| `breakdown.html` (line 629) | `bdDonut` | Fantasy points breakdown donut chart |
| `career-compare.html` (line 625) | `cc-chart` | Career stat comparison line chart |
| `career.html` (line 658) | `ppg-chart` | PPG career trend chart |
| `draftclass.html` (line 488) | `dc-chart` | Draft class value chart |
| `explorer.html` (line 425) | `scatter-canvas` | Stat explorer scatter plot |
| `usage.html` (line 512) | `usage-sparkline` | Usage trend sparklines |

### league-intel.html (3 creation points, JS-generated)

| Line | Canvas ID pattern | What it shows |
|------|------------------|---------------|
| 5661 | `build-radar-{id}` | Build profile radar chart |
| 6350 | `mc-hist-{league}-{rid}` | Monte Carlo probability histogram |
| 6547 | `mc-hist-{league}-{rid}` | Monte Carlo histogram (deep-dive) |

### Correctly attributed canvases (DO NOT CHANGE)

`league-intel.html` already has ARIA on timeline and manager compare canvases:
```javascript
'<canvas id="timeline-' + ci + '" role="img" aria-label="Manager weekly activity timeline" ...>'
'<canvas id="mgrCompareRadar" ... role="img" aria-label="Manager comparison radar chart">'
```

## Fix

Add `role="img"` and descriptive `aria-label` to each canvas in the innerHTML template string:

```javascript
'<canvas id="bdDonut" width="560" height="560" role="img" aria-label="Fantasy points breakdown donut chart"></canvas>'
```

For usage.html sparklines (many per page), a generic label is fine:
```javascript
'<canvas class="usage-sparkline" ... role="img" aria-label="Weekly usage trend sparkline"></canvas>'
```

## Design Rule

WCAG 2.1 SC 1.1.1: Non-text Content. Canvas must have text alternatives. Follow the pattern already used in league-intel.html for timeline canvases.
