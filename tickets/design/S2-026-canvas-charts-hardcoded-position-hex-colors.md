---
id: S2-026
severity: S2
category: design
title: Canvas charts may use hardcoded hex for position colors instead of getCanvasTheme()
source: deep-audit
status: open
---

## Problem

Some canvas-drawn charts (aging curves, scatter plot, comparison charts) may still use hardcoded hex values for position colors (#5b7fff for QB, #2ec4b6 for RB, etc.) instead of reading from the `getCanvasTheme()` helper. If position colors change in the design system, canvas elements won't update.

## Root Cause

Hardcoded position colors have been fixed in most places (PROGRESS.md Phase A task 5), but canvas contexts that call `ctx.fillStyle` with raw hex values may remain in:
- `frontend/charts.js` — comparison chart color palettes
- `frontend/lab-panels.js:6702` — comparison color array uses Tailwind colors (`#eab308`, `#16a34a`, `#f472b6`)
- `frontend/lab-panels.js:6356` — TD component color uses `#e74c3c` (Tailwind red, not Razzle red `#e63946`)

## Fix

1. Grep canvas-drawing code for hardcoded hex position colors
2. Replace with `getCanvasTheme()` helper properties
3. Replace non-Razzle palette colors (`#e74c3c`, `#eab308`, `#16a34a`, `#f472b6`) with design system equivalents

## Accept When

- No hardcoded position hex colors remain in canvas drawing code
- All canvas position colors read from getCanvasTheme() or CSS custom properties
