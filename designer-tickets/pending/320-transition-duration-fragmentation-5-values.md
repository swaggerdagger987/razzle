# DES-320: Transition duration fragmentation — 5 different values for similar interactions

**Priority**: P2
**Area**: styles.css, lab-panels.css (sitewide)
**Cycle**: 30

## Problem

59 transition declarations across styles.css and lab-panels.css use 5 different duration values for similar interaction types:

| Duration | Count | Usage |
|----------|-------|-------|
| 0.1s | 16 | Table row hovers, backgrounds |
| 0.12s | 8 | Buttons, nav items, chips |
| 0.15s | 24 | Cards, tabs, filter buttons |
| 0.3s | 8 | Progress bar fills, dark mode body |
| 0.4s | 2 | Some progress bar fills |

Same-type elements use different durations:
- `.btn-chunky` = 0.12s, but `.rankings-filter-btn` = 0.15s (both are buttons)
- Table row hovers = 0.1s in some panels, 0.15s in others
- `.tv-bar-fill` = 0.4s at line 619 but 0.3s at line 1055 (same element class)

## Fix

Standardize to 3 CSS custom property tokens:

```css
:root {
  --transition-fast: 0.1s;    /* Table rows, backgrounds, subtle */
  --transition-base: 0.15s;   /* Buttons, cards, chips, tabs */
  --transition-slow: 0.3s;    /* Progress bars, theme transitions */
}
```

Replace all 59 declarations to use the appropriate token. Merge 0.12s into 0.15s (difference is imperceptible). Remove the 0.4s outliers.

## Why This Matters

Inconsistent animation timing creates a "something is off" feeling. A button that lifts in 0.12s next to a filter tab that lifts in 0.15s creates micro-dissonance. The design system governs colors, fonts, and radius — transitions should be governed too.
