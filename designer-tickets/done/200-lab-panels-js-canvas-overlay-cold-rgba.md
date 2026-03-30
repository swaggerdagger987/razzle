<!-- PM: ready -->
# DQ-467: lab-panels.js Canvas Overlay Uses Cold White/Black RGBA

**Priority**: P2
**Category**: Dark Mode / Design Token
**Affects**: frontend/lab-panels.js

## Problem

Canvas overlay rendering (~line 10118) uses pure white `rgba(255,255,255,0.3)` in light mode and pure black `rgba(0,0,0,0.3)` in dark mode. DESIGN.md prohibits cold colors — overlays should use warm sand/espresso tints.

## Violation

```javascript
ctx.fillStyle = th.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
```

## Fix

Replace with warm equivalents:
- Light mode: `'rgba(247,239,229,0.4)'` (--bg-card sand tint)
- Dark mode: `'rgba(45,31,20,0.4)'` (--ink espresso tint)

Or better: use `getCanvasTheme().overlayColor` if such a property exists (add it if not).

## Acceptance

No `rgba(0,0,0` or `rgba(255,255,255` in canvas overlay code in lab-panels.js.
