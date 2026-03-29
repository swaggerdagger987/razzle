# S2-007: Replace blur-style shadows with flat offset shadows

**Severity**: S2 (Medium)
**Category**: design
**Source**: DESIGN-TICKETS.md #3
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

DESIGN.md specifies `4px 4px 0 var(--ink)` — zero blur, hard offset. Two instances use soft diffused shadows:

1. `frontend/lab.html:596` — frozen column shadow:
```css
box-shadow: -8px 0 24px rgba(45,31,20,0.15);
```

2. `frontend/lab.html:1037` — sticky thead shadow:
```css
box-shadow: 0 4px 8px rgba(45,31,20,0.08);
```

These create a fintech/material design look that clashes with the comic-strip sticker aesthetic.

## Fix

Replace with functional alternatives that match the chunky design:

```css
/* Frozen column edge — use dashed border */
border-right: 2px dashed var(--ink-faint);
box-shadow: none;

/* Sticky thead — use solid bottom border */
border-bottom: 3px solid var(--ink);
box-shadow: none;
```

## Files to Change

- `frontend/lab.html:596` — frozen column shadow
- `frontend/lab.html:1037` — sticky thead shadow

## Accept When

Zero instances of blur shadows (3rd value > 0 in box-shadow) in lab.html.
