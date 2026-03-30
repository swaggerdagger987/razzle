---
id: DQ-289
priority: P2
category: design token / architectural
status: open
---

# DQ-289: app.js getCanvasTheme() hardcodes 9 base palette values instead of reading CSS vars

## Problem

DQ-069 (done) fixed the ACCENT colors in getCanvasTheme() to read from CSS variables. But the BASE palette (bg, bgWarm, bgCard, ink, inkMedium, inkLight, inkFaint, white, gridLine, subtitleAlpha) is still hardcoded with ternary operators:

```javascript
bg: isDark ? "#2d1f14" : "#ede0cf",        // hardcoded
bgWarm: isDark ? "#3b2821" : "#e5d5c3",    // hardcoded
bgCard: isDark ? "#4a3728" : "#f7efe5",    // hardcoded
ink: isDark ? "#ede0cf" : "#2d1f14",       // hardcoded
inkMedium: isDark ? "#c4b5a5" : "#5c4a3d", // hardcoded
// ... vs ...
orange: s.getPropertyValue('--orange').trim() || "#d97757",  // CORRECT pattern
```

The correct pattern (lines 110-115) already exists for accent colors -- it should be applied to the base palette too.

## Where

`frontend/app.js:100-109`

## Fix

Apply the same `s.getPropertyValue()` pattern used for accents (lines 110-115):

```javascript
bg: s.getPropertyValue('--bg').trim() || (isDark ? "#2d1f14" : "#ede0cf"),
bgWarm: s.getPropertyValue('--bg-warm').trim() || (isDark ? "#3b2821" : "#e5d5c3"),
bgCard: s.getPropertyValue('--bg-card').trim() || (isDark ? "#4a3728" : "#f7efe5"),
ink: s.getPropertyValue('--ink').trim() || (isDark ? "#ede0cf" : "#2d1f14"),
inkMedium: s.getPropertyValue('--ink-medium').trim() || (isDark ? "#c4b5a5" : "#5c4a3d"),
inkLight: s.getPropertyValue('--ink-light').trim() || "#8a7565",
inkFaint: s.getPropertyValue('--ink-faint').trim() || (isDark ? "#5c4a3d" : "#c4b5a5"),
white: isDark ? s.getPropertyValue('--bg').trim() || "#ede0cf" : "#fff",
```

Keep the ternary as FALLBACK only. Primary source should be CSS vars.

## Impact

Every canvas chart on every page uses getCanvasTheme(). This is the single function that bridges CSS design tokens to canvas rendering. Half of it reads tokens correctly, half doesn't. Fixing this makes ALL canvas elements respond to CSS variable changes automatically.

## Not a dupe of

DQ-069 (done) added accent colors (orange, green, blue, etc.). This ticket fixes the remaining base palette properties that were left hardcoded.
