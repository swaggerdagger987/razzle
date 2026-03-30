<!-- PM: ready -->
# DQ-465: lab.js getHeatColor() — 12 Hardcoded RGBA Heat Values Not Centralized

**Priority**: P2
**Category**: Design Token / Maintainability
**Affects**: frontend/lab.js

## Problem

The `getHeatColor()` function (~lines 5306-5320) returns 12+ hardcoded RGBA color strings for cell heat tinting. These use raw RGB values of design tokens (green #2ec4b6, red #e63946) but at varying opacities, and none are centralized or themeable.

## Violations

```javascript
if (pct >= 90) return "rgba(46, 196, 182, 0.35)";   // --green at 35%
if (pct >= 80) return "rgba(46, 196, 182, 0.25)";   // --green at 25%
// ... 8 more hardcoded values ...
if (pct <= 10) return "rgba(230, 57, 70, 0.30)";    // --red at 30%
```

These don't adapt to dark mode (where opacity may need adjustment for contrast).

## Fix

Extract heat colors to a `HEAT_COLORS` object or compute from CSS variable values using `getComputedStyle`. At minimum, define the RGBA values as constants at the top of the file so they can be updated in one place.

## Acceptance

No inline RGBA strings in getHeatColor(). Colors defined as named constants or computed from CSS vars.
