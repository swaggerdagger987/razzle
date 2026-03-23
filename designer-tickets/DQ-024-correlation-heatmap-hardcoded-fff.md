# DQ-024: Correlation heatmap canvas uses hardcoded #fff for text

**Priority**: P1 — Harsh white text in dark mode
**Category**: Dark Mode / Canvas
**Severity**: HIGH — White text on espresso background breaks Espresso Flip palette

## Problem

In `frontend/lab-panels.js` line ~9821, the correlation heatmap uses raw `#fff` instead of the theme-aware `t.white` (which resolves to sand #ede0cf in dark mode):

```javascript
ctx.fillStyle = Math.abs(r) > 0.5 ? '#fff' : t.ink;
```

In dark mode, this creates harsh cold white text instead of warm sand text.

Similarly, line ~10118 uses cold black separator:
```javascript
ctx.fillStyle = th.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
```

## Fix

```javascript
// Line ~9821:
ctx.fillStyle = Math.abs(r) > 0.5 ? t.white : t.ink;

// Line ~10118:
ctx.fillStyle = th.isDark ? 'rgba(237,224,207,0.2)' : 'rgba(255,255,255,0.3)';
```

## Test

Open Lab → Correlation panel → Toggle dark mode. Text should be warm sand, not harsh white.
