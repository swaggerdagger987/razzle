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

12+ hardcoded hex color definitions instead of using `getCanvasTheme()` (defined in `frontend/app.js:96`):

**charts.js**:
- Line 3: `CHART_COLORS = ["#d97757", "#5b7fff", "#2ec4b6", "#8b5cf6", "#e63946"]`
- Line 341: `posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" }`
- Line 672: Duplicate `posColors`
- Line 1021: Duplicate `posColors`
- Lines 379, 387, 533, 549, 561: Hardcoded `"#d97757"` in stroke/fill

**lab-panels.js**:
- Line 28: `POS_COLORS = { QB: '#5b7fff', RB: '#2ec4b6', WR: '#d97757', TE: '#8b5cf6' }`
- Line 5746: `slotColors = ['#d97757', '#5b7fff', '#2ec4b6']`
- Line 6359: `compColors = { pass_yd: '#5b7fff', rush_yd: '#2ec4b6', rec_yd: '#d97757', ... }`
- Line 6702: Tailwind colors (`#eab308`, `#16a34a`, `#f472b6`)
- Line 10002: `POS_COLS = { QB: '#5b7fff', RB: '#2ec4b6', WR: '#d97757', TE: '#8b5cf6' }`

## Fix

1. Grep canvas-drawing code for hardcoded hex position colors
2. Replace with `getCanvasTheme()` helper properties
3. Replace non-Razzle palette colors (`#e74c3c`, `#eab308`, `#16a34a`, `#f472b6`) with design system equivalents

## Accept When

- No hardcoded position hex colors remain in canvas drawing code
- All canvas position colors read from getCanvasTheme() or CSS custom properties
