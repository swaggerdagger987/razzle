# DES-069: getCanvasTheme() missing accent color properties

**Priority**: P2
**Area**: frontend/app.js line 47
**Cycle**: 7

## Problem

The `getCanvasTheme()` function (app.js:47-62) provides background/ink colors for canvas rendering:

```javascript
function getCanvasTheme() {
  var isDark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    bg, bgWarm, bgCard, ink, inkMedium, inkLight, inkFaint, white, gridLine, subtitleAlpha, isDark
  };
}
```

Missing: **accent colors** — green, blue, orange, red, purple, yellow.

This forces every canvas function to hardcode hex accent colors directly. There are 30+ instances of hardcoded hex accents in lab.js canvas code (lines 6182, 7436, 7482, 7494, 7589, 7603, 7684, 8086, 8407-8410, 8700, 8792-8793, 9248-9251, etc.).

## Fix

Add accent colors that read from CSS custom properties:

```javascript
function getCanvasTheme() {
  var isDark = document.documentElement.getAttribute("data-theme") === "dark";
  var s = getComputedStyle(document.documentElement);
  return {
    // ... existing properties ...
    orange: s.getPropertyValue('--orange').trim() || "#d97757",
    green: s.getPropertyValue('--green').trim() || "#2ec4b6",
    blue: s.getPropertyValue('--blue').trim() || "#5b7fff",
    red: s.getPropertyValue('--red').trim() || "#e63946",
    purple: s.getPropertyValue('--purple').trim() || "#8b5cf6",
    yellow: s.getPropertyValue('--yellow').trim() || "#ffc857",
    isDark: isDark
  };
}
```

## Why This Matters

This is the ROOT CAUSE ticket. Fixing DES-069 unlocks fixing DES-070 through DES-072 — all the canvas hardcoded hex issues become simple replacements of `"#2ec4b6"` with `t.green`.

## Design Rule

DESIGN.md: All accent colors are defined as CSS variables. Canvas code should read from CSS, not hardcode.
