# DQ-271: Dark mode toggle doesn't dispatch custom event — canvas charts stay stale

**Priority**: P1 — Every chart on the site renders wrong colors after toggle
**Category**: Architecture / Dark Mode
**Severity**: HIGH — User toggles dark mode, canvas charts stay in old theme until page reload

## Problem

`toggleTheme()` in app.js (lines 58-70) sets `data-theme` attribute and updates meta theme-color, but does NOT dispatch a custom event. Canvas-based charts (scatter, aging curves, sparklines, heatmaps) cache theme colors via `getCanvasTheme()` at render time. After dark mode toggle, no event fires to tell them to re-render.

Compare: `razzle-plan-changed` event IS dispatched at line 735 for plan changes. Dark mode deserves the same.

## Impact

Every canvas chart on every page (Lab panels, standalone pages, compare page) shows stale colors after toggle. User sees sand-colored chart text on dark background (or vice versa). Must reload page to fix.

## Fix

In `toggleTheme()` (app.js ~line 64/68), add after theme change:
```javascript
window.dispatchEvent(new CustomEvent("razzle-theme-changed", { detail: { isDark: document.documentElement.dataset.theme === "dark" } }));
```

Then in each canvas renderer, listen and re-render:
```javascript
window.addEventListener("razzle-theme-changed", () => renderChart());
```

## Files
- `frontend/app.js` lines 58-70
