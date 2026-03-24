# DQ-464: player.js Dark Mode Overlay Uses Cold Black Instead of Warm Espresso

**Priority**: P2
**Category**: Dark Mode / Design Token
**Affects**: frontend/player.js

## Problem

The player profile modal overlay in dark mode uses `rgba(0,0,0,0.5)` — pure cold black. DESIGN.md says "NO cold grays anywhere — even dark mode stays warm (brown, not gray)." The light mode path correctly uses `rgba(45,31,20,0.5)` (warm espresso).

## Violation

```javascript
// ~line 726
var overlayBg = document.documentElement.getAttribute("data-theme") === "dark"
  ? "rgba(0,0,0,0.5)"      // WRONG: cold black
  : "rgba(45,31,20,0.5)";  // correct: warm espresso
```

## Fix

Change dark mode branch to `"rgba(26,17,10,0.7)"` (--bg-ink at 70% opacity) or `"rgba(45,31,20,0.7)"` (espresso at 70% — darker for dark mode contrast).

## Acceptance

No `rgba(0,0,0` in player.js overlay code.
