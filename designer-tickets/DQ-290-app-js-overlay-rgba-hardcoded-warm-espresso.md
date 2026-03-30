---
id: DQ-290
priority: P2
category: hardcoded color
status: open
---

# DQ-290: app.js modal overlays hardcode warm espresso RGBA instead of deriving from CSS vars

## Problem

Two modal overlay backgrounds in app.js hardcode warm espresso RGBA values:

```javascript
// Line 789 (showPlanModal)
var overlayBg = isDark ? "rgba(26,17,10,0.7)" : "rgba(45,31,20,0.6)";

// Line 1812 (openPlayerPopup)
var popupBg = isDark ? "rgba(26,17,10,0.6)" : "rgba(45,31,20,0.5)";
```

These are correctly WARM (not cold black like DQ-023), but they hardcode the exact RGB values of the espresso palette. If the design system shifts the base brown, these overlays won't update.

## Where

- `frontend/app.js:789` -- showPlanModal overlay
- `frontend/app.js:1812` -- openPlayerPopup overlay

## Fix

Derive overlay colors from CSS variables using getCanvasTheme() or getComputedStyle():

```javascript
var s = getComputedStyle(document.documentElement);
var inkVal = s.getPropertyValue('--ink').trim();
// Convert hex to rgba with opacity
var overlayBg = hexToRgba(inkVal, isDark ? 0.7 : 0.6);
```

Or simpler: create a CSS class `.modal-overlay` in styles.css with the overlay background defined via CSS variables and dark mode override, then apply the class instead of inline styles.

## Not a dupe of

DQ-023 covers COLD BLACK `rgba(0,0,0,...)` overlays. These use WARM espresso values -- different problem. The issue here is hardcoding rather than wrong temperature.
