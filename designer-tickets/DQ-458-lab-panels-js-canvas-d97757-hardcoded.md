---
id: DQ-458
priority: P2
category: color-tokens
status: open
cycle: 58
---

# DQ-458: lab-panels.js has 5 hardcoded #d97757 in canvas drawing — won't respond to dark mode

## Problem

DQ-007 covers hardcoded position colors in `charts.js` (3 instances). This ticket covers a DIFFERENT file: `lab-panels.js` has 5 instances of hardcoded `#d97757` (terracotta orange) in canvas `ctx.fillStyle` / `ctx.strokeStyle` calls.

These bypass the CSS variable system and won't respond to dark mode tint adjustments.

## Evidence

In `frontend/lab-panels.js`:
- Line ~4951: `ctx.strokeStyle = '#d97757';`
- Line ~4958: `ctx.fillStyle = '#d97757';`
- Line ~7268: `ctx.fillStyle = '#d97757';`
- Line ~9956: `sctx.strokeStyle = '#d97757';`
- Line ~10083: `ctx.strokeStyle = '#d97757';`

The file already has `getCanvasTheme()` calls elsewhere that properly read CSS variables. These 5 instances were missed.

## Fix

Replace each hardcoded `#d97757` with the theme-aware equivalent:
```javascript
// Before
ctx.strokeStyle = '#d97757';

// After
const th = typeof getCanvasTheme === 'function' ? getCanvasTheme() : {};
ctx.strokeStyle = th.orange || '#d97757';
```

Or if `getCanvasTheme()` is already called earlier in the same function, reuse the existing `th` variable.

## Why It Matters

Dark mode may shift accent color tints. Hardcoded hex means 5 canvas elements stay light-mode orange even when everything else adapts.

## Verification

```bash
grep -n "#d97757" frontend/lab-panels.js
# Should be 0 after fix
```
