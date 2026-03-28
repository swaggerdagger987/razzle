---
id: S2-110
severity: S2
confidence: HIGH
category: design
source: DQ-249+289+381+383+458+477+490
status: OPEN
---

# Canvas drawing uses 20+ hardcoded hex colors — dark mode broken

## Root Cause

Canvas 2D drawing code uses hardcoded hex colors instead of reading CSS variables via `getCanvasTheme()`. In dark mode, these elements render in light-mode colors against dark backgrounds.

## Findings

1. **`app.js` `getCanvasTheme()` hardcodes 9 base palette values** (DQ-289) — Instead of reading from `getComputedStyle(document.documentElement)`, the function has fallback hex values that may not match the current theme.

2. **`lab-panels.js` has 5 hardcoded `#d97757`** (DQ-458) — Terracotta position color in canvas drawing won't respond to dark mode. Lines include scatter plot dots and chart annotations.

3. **Boom/bust canvas functions use hardcoded hex** (DQ-381) — `lab.js` boom/bust range bar and histogram use hardcoded colors instead of `getCanvasTheme()`.

4. **Boom/bust PNG export uses hardcoded light-mode colors** (DQ-383) — Export always renders in light mode regardless of user's current theme.

5. **`warroom.js` canvas draws 5 cold-black `rgba(0,0,0)` overlays** (DQ-477) — Outside the scope of previous dark mode fixes (DES-308).

6. **`compare.js` uses hardcoded `white` stroke/fill** (DQ-490) — Unreadable in light mode on sand background, wrong in dark mode.

7. **Canvas loading screen uses hardcoded hex** (DQ-249) — `waitAndStart()` loading indicator.

## Fix

All canvas drawing should use `getCanvasTheme()` (already defined in `app.js`) which returns theme-aware colors. Replace hardcoded hex with `t.ink`, `t.bg`, `t.orange`, etc.

## Files

- `frontend/app.js` — `getCanvasTheme()` should read CSS vars, not hardcode
- `frontend/lab.js` — boom/bust canvas
- `frontend/lab-panels.js` — scatter plots, charts
- `frontend/compare.js` — radar chart fill/stroke
- `frontend/warroom.js` — overlay colors

## Acceptance Criteria

1. Toggle dark mode. All canvas-drawn elements use dark palette.
2. PNG exports respect current theme
3. No hardcoded `#d97757`, `#fff`, or `rgba(0,0,0)` in canvas code (except warroom pixel art)
