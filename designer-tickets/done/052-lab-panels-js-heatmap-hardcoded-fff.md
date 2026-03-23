# DES-052: lab-panels.js matchup heatmap uses hardcoded #fff for text

**Priority**: P2
**Area**: lab-panels.js (matchup heatmap panel)
**Found by**: Design QA Cycle 5

## Problem

Line 3598 in lab-panels.js uses hardcoded `'#fff'` for text color on dark heatmap cells:

```javascript
var textColor = (bg === '#e63946' || bg === '#2ec4b6' || bg === '#8b1a1a' || bg === '#1a5a50') ? '#fff' : 'var(--ink)';
```

In dark mode, the design system uses `#ede0cf` (sand) as the "white" equivalent, not pure `#fff`. Pure white on the warm espresso palette looks harsh and out-of-place.

Additionally, the heatmap color logic (lines 3485-3502) uses 10 hardcoded hex values for the 5-tier color scale in both light and dark modes. While these are correct conditionally, they should be CSS variables or at minimum a named constant object for maintainability.

## Fix

Replace `'#fff'` with `'var(--text-on-accent)'` (which is white in light mode, sand in dark mode):

```javascript
var textColor = (bg === '#e63946' || bg === '#2ec4b6' || bg === '#8b1a1a' || bg === '#1a5a50') ? 'var(--text-on-accent)' : 'var(--ink)';
```
