# DES-072: lab.js DVS badge canvas uses hardcoded hex threshold colors

**Priority**: P2
**Area**: frontend/lab.js line 6182 (Dynasty Value Score badge in canvas export)
**Cycle**: 7
**Depends on**: DES-069

## Problem

The DVS (Dynasty Value Score) badge in the prospect scoring canvas export uses hardcoded hex for threshold-based coloring:

```javascript
// Line 6182
const dvsColor = dvs >= 85 ? "#2ec4b6" : dvs >= 70 ? "#5b7fff" : dvs >= 55 ? "#d97757" : "#8a7565";

// Lines 6184-6189 — badge uses dvsColor for fill, stroke, and text
ctx.fillStyle = dvsColor + "30";  // alpha tint
ctx.strokeStyle = dvsColor;
ctx.fillStyle = dvsColor;
```

These hex values map to design tokens: `#2ec4b6` = green, `#5b7fff` = blue, `#d97757` = orange, `#8a7565` = ink-light.

## Fix

After DES-069 adds accent colors to the canvas theme:
```javascript
const t = getCanvasTheme();
const dvsColor = dvs >= 85 ? t.green : dvs >= 70 ? t.blue : dvs >= 55 ? t.orange : t.inkLight;
```

## Design Rule

DESIGN.md: All accent colors have CSS variable tokens. Canvas exports should read from theme for dark mode compatibility.
