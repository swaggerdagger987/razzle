# S3-045: Konami code confetti uses hardcoded hex position colors

**Severity**: S3 (Low)
**Category**: design
**Source**: designer-tickets DQ-019
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/app.js:1812` — Konami easter egg confetti uses hardcoded hex colors instead of CSS variables. These won't adapt to dark mode.

```javascript
// app.js:1812
c.style.background = ["#d97757","#5b7fff","#2ec4b6","#8b5cf6","#ffc857"][i % 5];
```

Compare with the welcome confetti at `app.js:873` which correctly uses CSS variables:
```javascript
// app.js:873
var colors = ["var(--orange)", "var(--pos-qb)", "var(--pos-rb)", "var(--pos-te)", "var(--green)"];
```

## Fix

```javascript
// app.js:1812
c.style.background = ["var(--orange)","var(--pos-qb)","var(--pos-rb)","var(--pos-te)","var(--yellow)"][i % 5];
```

## Files to Change

- `frontend/app.js:1812` — replace 5 hardcoded hex values with CSS variables

## Accept When

1. Konami confetti uses CSS variables, matching welcome confetti pattern
2. Confetti adapts to dark mode theme
3. Easter egg still triggers correctly

## Do NOT Touch

- Konami code sequence detection
- Confetti animation/physics
- Tiger spin animation
