# S2-027: Canvas charts hardcode position hex colors in 3 files

**Severity**: S2 (Minor)
**Category**: design
**Source**: Deep Audit 2026-03-28, finding S2-004

## Problem

Canvas-drawn charts hardcode position color hex values instead of reading CSS
variables. If position colors change in the design system, canvas elements
won't update. Also breaks dark mode color adaptation for canvas charts.

## Root Cause

Hardcoded position color objects in:

1. `frontend/charts.js:341` — Hardcoded object literal with all four position colors
2. `frontend/lab-panels.js:28` — Hardcoded `POS_COLORS` object
3. `frontend/lab.js:9606-9609` — Hardcoded position color map

The correct pattern exists in:
- `frontend/app.js:674-677` — `getPosColors()` function uses `getComputedStyle()`
  with CSS variable fallback: reads `--pos-qb`, `--pos-rb`, `--pos-wr`, `--pos-te`

## Fix

1. Replace hardcoded color objects in `charts.js`, `lab-panels.js`, `lab.js` with
   calls to `getPosColors()` from `app.js`
2. Ensure `getPosColors()` is available globally (it's already on `window` scope via app.js)
3. Call it at render time, not at module load (so it picks up theme changes)

## Scope

- 3 files: `frontend/charts.js`, `frontend/lab-panels.js`, `frontend/lab.js`
- ~6 line changes (replace object literal with function call)
