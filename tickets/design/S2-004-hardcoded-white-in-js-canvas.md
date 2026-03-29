# S2-004: Hardcoded #fff in lab.js banner and lab-panels.js canvas

**Severity**: S2 (Medium)
**Category**: design
**Source**: DESIGN-QA-TICKETS.md DES-403, DES-404
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

Two instances of hardcoded white that won't respond to dark mode:

1. `frontend/lab.js:1185` — Banner uses hardcoded `#fff`:
```javascript
banner.style.cssText = "background:var(--orange);color:#fff;text-align:center;..."
```

2. `frontend/lab-panels.js:9833` — Canvas correlation heatmap uses `#fff`:
```javascript
ctx.fillStyle = Math.abs(r) > 0.5 ? '#fff' : t.ink;
```
The `t` object (from `getCanvasTheme()`) already has a `white` property that's theme-aware.

## Fix

```javascript
// lab.js:1185
banner.style.cssText = "background:var(--orange);color:var(--text-on-accent);text-align:center;..."

// lab-panels.js:9833
ctx.fillStyle = Math.abs(r) > 0.5 ? t.white : t.ink;
```

## Files to Change

- `frontend/lab.js:1185`
- `frontend/lab-panels.js:9833`

## Accept When

Zero instances of hardcoded `#fff` in lab.js and lab-panels.js (grep to verify).
