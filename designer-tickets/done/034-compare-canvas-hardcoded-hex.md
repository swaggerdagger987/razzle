# DES-034: Compare page canvas export uses hardcoded hex colors

**Priority**: P2
**Area**: compare.js
**Impact**: The compare page PNG export — a marketing vehicle (every screenshot = billboard) — uses hardcoded hex colors instead of the canvas theme system. Dark mode exports render with wrong palette.

## The Problem

`frontend/compare.js` line 3:
```javascript
var POS_COLORS = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
```
Duplicates position colors already available via CSS variables.

Line 605:
```javascript
ctx.fillStyle = "#d97757";  // hardcoded orange for VS badge
```

Lines 633, 666, 672:
```javascript
// Magic RGBA values for zebra stripes, watermark, annotation
"rgba(237,224,207,0.06)"   // sand at 6% — should use theme
"rgba(237,224,207,0.3)"    // sand at 30% — should use theme
"rgba(237,224,207,0.25)"   // sand at 25% — should use theme
```

Meanwhile, `app.js` provides `getCanvasTheme()` which returns theme-aware colors. compare.js partially uses it but falls back to hardcoded values in many places.

## The Fix

Replace hardcoded colors with `getCanvasTheme()` lookups:
```javascript
var t = getCanvasTheme();
// Use t.bg, t.ink, t.bgCard, t.inkMedium instead of magic hex values

// For position colors, pull from CSS:
var style = getComputedStyle(document.documentElement);
var POS_COLORS = {
  QB: style.getPropertyValue('--pos-qb').trim(),
  RB: style.getPropertyValue('--pos-rb').trim(),
  WR: style.getPropertyValue('--pos-wr').trim(),
  TE: style.getPropertyValue('--pos-te').trim()
};
```

## Why This Matters

Compare page PNGs are specifically designed for sharing — they include watermarks and formatted layouts. If a dark-mode user exports a comparison, it should use the dark palette. Hardcoded light-mode colors create jarring, off-brand exports.
