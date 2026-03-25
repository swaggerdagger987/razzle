---
id: DQ-497
title: 60+ hardcoded rgba(217,119,87,...) hover tint instances not tokenized
severity: P3
status: open
component: Sitewide CSS
phase: Multiple
---

## Problem

The orange hover/accent tint `rgba(217,119,87, 0.08)` is hardcoded in 60+ CSS rules across lab-panels.css (40+ selectors), standalone HTML pages (10+), lab.html, lab.js, and charts.js. Each instance repeats the raw RGB values of `--orange` (#d97757) with varying opacity levels (0.05, 0.06, 0.08, 0.12, 0.15, 0.18, 0.25, 0.35, 0.5).

This is not a visual bug — the color is correct. But:
1. Any palette change requires updating 60+ locations
2. Dark mode overrides must be duplicated for each selector (lab-panels.css already does this at line 4902)
3. `color-mix()` or CSS custom property with alpha channel would be a single-source fix

Different from DQ-058 (position hex), DQ-286 (search highlight), and DQ-289 (canvas theme).

## Key Locations

- `frontend/lab-panels.css` — 40+ `tr:hover` selectors (lines ~339-2967)
- `frontend/lab.html` — sort column backgrounds (lines 1063-1068)
- `frontend/lab.js` — heat color bars, sparkline fills (lines 1901, 5776, 5814, 6310)
- `frontend/charts.js` — trendline fills (lines 1215, 1490)
- `frontend/drops.html:53`, `frontend/advantage.html:54`, etc. — standalone hover

## Fix

Add CSS custom properties:

```css
:root {
  --orange-rgb: 217, 119, 87;
  --hover-tint: rgba(var(--orange-rgb), 0.08);
  --hover-tint-strong: rgba(var(--orange-rgb), 0.18);
}
[data-theme="dark"] {
  --hover-tint: rgba(var(--orange-rgb), 0.18);
  --hover-tint-strong: rgba(var(--orange-rgb), 0.25);
}
```

Then replace all 60+ instances with `var(--hover-tint)`.

## Acceptance Criteria

- [ ] `--hover-tint` CSS variable defined in :root and dark mode
- [ ] All `rgba(217,119,87, 0.08)` instances replaced with `var(--hover-tint)`
- [ ] Dark mode hover tint automatically uses higher opacity
