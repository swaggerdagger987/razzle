# DES-079: textColorForBg() always returns light-mode ink hex — dark mode bug

**Priority**: P1
**Area**: frontend/lab.js lines 9826, 9845-9846
**Cycle**: 8

## Problem

The `textColorForBg()` function returns hardcoded light-mode ink values:

```javascript
function textColorForBg(pct) {
  if (pct == null) return "#8a7565";  // hardcoded --ink-light (light mode)
  return "#2d1f14";                   // hardcoded --ink (light mode)
}
```

This function is used to set text color over heatmap canvas cells. In dark mode, it draws dark espresso text (`#2d1f14`) onto dark espresso-tinted backgrounds, causing contrast issues. The text becomes nearly invisible.

This is a VISIBLE BUG in dark mode — not just a code smell.

## Fix

Read CSS vars at runtime:

```javascript
function textColorForBg(pct) {
  const styles = getComputedStyle(document.documentElement);
  if (pct == null) return styles.getPropertyValue('--ink-light').trim() || "#8a7565";
  return styles.getPropertyValue('--ink').trim() || "#2d1f14";
}
```

Or if this is canvas-only code, use the `getCanvasTheme()` object:

```javascript
function textColorForBg(pct) {
  const t = getCanvasTheme();
  if (pct == null) return t.inkLight || "#8a7565";
  return t.ink || "#2d1f14";
}
```

(This depends on DES-069 adding `inkLight` to the theme object, or read from CSS directly.)

## Design Rule

DESIGN.md dark mode: ink inverts from `#2d1f14` to `#ede0cf`. Hardcoding the light-mode value breaks dark mode.
