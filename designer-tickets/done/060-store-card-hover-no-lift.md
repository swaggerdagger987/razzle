# DES-060: store-card:hover has 4px shadow instead of 6px — no lift effect

**Priority**: P1
**Area**: frontend/lab.html line 2545-2548 (Formula Store)
**Cycle**: 6

## Problem

Formula Store cards have identical box-shadow on hover as at rest (4px 4px 0). The design guide mandates hover-lift: `6px 6px 0 + translate(-2px, -2px)`. The cards do have `transform: translate(-2px, -2px)` but the shadow doesn't grow, so the lift feels broken — the card moves but doesn't appear to "pop off" the page.

## Current Code

```css
.store-card {
  box-shadow: 4px 4px 0 var(--ink);  /* base — correct */
}
.store-card:hover {
  box-shadow: 4px 4px 0 var(--ink);  /* WRONG — same as base */
  transform: translate(-2px, -2px);
}
```

## Fix

```css
.store-card:hover {
  box-shadow: 6px 6px 0 var(--ink);  /* lift shadow */
  transform: translate(-2px, -2px);
}
```

## Why This Matters

The Formula Store is a showcase feature — community-created scoring models. Hover-lift is the design guide's signature interaction ("interaction should feel physical"). Every other card component has this pattern. Formula Store cards being flat on hover makes them feel dead compared to the rest of the site.

## Design Rule

DESIGN.md: "Hover lift: 6px 6px 0 + translate(-2px, -2px)". Same pattern as DES-030 (plan cards, fixed) and DES-050 (league cards, fixed).
