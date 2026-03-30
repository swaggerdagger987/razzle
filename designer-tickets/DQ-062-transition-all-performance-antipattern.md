# DQ-062: `transition: all` performance anti-pattern — 23+ instances

**Priority**: P2 — Performance impact on complex pages (agents, aging)
**Category**: Interactive States / Performance
**Severity**: MEDIUM — animates layout properties unnecessarily

## Problem

`transition: all` animates EVERY CSS property change, including layout-triggering ones like width, height, padding, and margin. This forces the browser to re-layout on every frame of the animation. DESIGN.md specifies hover lifts use `transform` and `box-shadow` — only those properties should be transitioned.

### agents.html — 20+ instances

Lines: 78, 105, 182, 477, 524, 555, 587, 722, 814, 1088, 1222, 1268, 1376, 1467, 1829, 1839, 1846 (and more)

```css
/* Current — bad */
transition: all 0.12s;

/* Should be — good */
transition: transform 0.12s, box-shadow 0.12s, background-color 0.12s;
```

### aging.html — 3 instances

Lines: 76, 120, 177 — same pattern.

## Fix

For each instance, replace `transition: all Xs` with the specific properties being animated:
- Cards/buttons: `transition: transform 0.12s, box-shadow 0.12s;`
- Elements with background change on hover: add `background-color 0.12s`
- Elements with border-color change: add `border-color 0.12s`

## Verification

Hover over agent badges and bio cards. The lift animation should feel identical but without layout thrashing (check Chrome DevTools > Performance for no "Recalculate Style" on hover).
