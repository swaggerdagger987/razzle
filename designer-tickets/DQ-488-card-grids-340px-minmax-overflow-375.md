---
id: DQ-488
title: Lab panel card grids use minmax(340px, 1fr) — overflows on 375px screens
severity: P2
category: mobile-responsiveness
file: frontend/lab-panels.css
lines: 932, 3136, 3234, 3482, 3634
---

## Problem

Five Lab panel card grids use `grid-template-columns: repeat(auto-fill, minmax(340px, 1fr))`. On a 375px screen (iPhone SE, most common small phone), the 340px minimum forces horizontal overflow because 340px + padding + margin > 375px viewport.

These grids have 768px media query overrides (`grid-template-columns: 1fr`) but the 375px case falls through — the browser tries to fit a 340px column into ~345px available space.

Affected panels:
- `.breakouts-grid` (line 932)
- `.arc-grid` (line 3136) — Archetypes
- `.aw2-grid` (line 3234) — Awards
- `.rec-grid` (line 3482) — Rookie Big Board
- `.tm-groups` (line 3634) — Team Rosters

## Expected

Add a 480px media query override for each grid: `grid-template-columns: 1fr` to force single-column on small phones. Or change the minmax minimum to `min(340px, 100%)`.

## Acceptance Criteria

- On a 375px viewport, all five grids display as single-column with no horizontal scroll
- Cards still display in multi-column on 768px+ screens
