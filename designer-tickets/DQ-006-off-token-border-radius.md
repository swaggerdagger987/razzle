# DQ-006: border-radius values not in design token set (3px, 4px, 6px)

**Priority**: P2 — visual inconsistency in badges and cards
**Category**: Border radius tokens
**Files**: `frontend/warroom.js` (2x 3px), `frontend/lab-panels.js` (3x 3px, 4x 6px), `frontend/lab.js` (1x 6px)

## Problem

DESIGN.md defines 3 border-radius tokens:
- `--radius-sm`: 8px (inputs, small badges)
- `--radius`: 12px (cards, containers)
- `--radius-lg`: 20px (pills, chips)

But 10 inline styles use non-token values:
- `border-radius:3px` — warroom.js:3113,3615 (LEADER badge, cloud-synced badge), lab-panels.js:9579,9580,9646 (progress bars, position badges)
- `border-radius:6px` — lab-panels.js:9577,9600,10003,10176, lab.js:9206 (stat cards, canvas, grade badges)
- `border-radius:4px` — lab-panels.js:10407,9655 (histogram bars, verdict badges)

## Fix

- Replace `3px` and `4px` with `var(--radius-sm)` (8px) for small badges/chips
- Replace `6px` with `var(--radius-sm)` (8px) for stat cards and canvas elements
- Exception: progress bar inner fills can keep small radius for visual fit

## Verification

Badges, stat cards, and verdict chips should all have the slightly-rounded "sticker" feel (8px minimum), not sharp-cornered.
