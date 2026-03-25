---
id: DQ-490
title: compare.js canvas uses white stroke/fill — unreadable in light mode, wrong in dark mode
severity: P2
category: dark-mode-parity
file: frontend/compare.js
lines: 423, 567, 719
---

## Problem

Three canvas drawing calls in compare.js use `ctx.strokeStyle = t.white` or `ctx.fillStyle = t.white`:
- Line 423: `ctx.strokeStyle = t.white` — radar chart outline
- Line 567: `ctx.strokeStyle = t.white` — second chart outline
- Line 719: `ctx.fillStyle = t.white` — label fill

In light mode (sand background), white strokes/fills are nearly invisible against the warm sand canvas background. In dark mode, `t.white` resolves to a cream color which may or may not be correct depending on context.

## Expected

Use theme-aware colors:
- For strokes that need to stand out: `ctx.strokeStyle = t.ink` (dark on light, light on dark)
- For fills meant as background: `ctx.fillStyle = t.card` (matches card surface)

## Acceptance Criteria

- Canvas elements in compare.js are visible in both light and dark mode
- No `t.white` used for strokes on sand/warm backgrounds
- Radar chart outlines are clearly visible in screenshots
