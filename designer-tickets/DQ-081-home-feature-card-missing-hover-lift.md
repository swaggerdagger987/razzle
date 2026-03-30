# DQ-081: Home page feature-card has no hover lift animation

**Priority**: P2 — brand interaction
**Category**: Interaction / Visual
**Files**: `frontend/index.html` lines 328-352

## Problem

The 4 "What you get" feature cards on the home page (100+ stat columns, Custom Formulas, PNG Export, Shareable URLs) have static box-shadow at rest but NO `:hover` rule. Cards don't respond to mouse interaction at all.

Every other card component on the same page has hover lift:
- `.btn-hero:hover` — `transform: translate(-2px, -2px)` + `6px 6px 0` shadow
- `.plan-card:hover` — same pattern (pricing.html)
- `.smart-chip:hover` — transform + color change
- `.store-card:hover` — fixed in DES-060

But `.feature-card:hover` is completely absent.

## Current Code

```css
.feature-card {
  background: var(--bg-card);
  border: 3px solid var(--ink);
  border-radius: 12px;
  box-shadow: 4px 4px 0 var(--ink);
  padding: 20px;
  /* NO :hover rule */
}
```

## Fix

Add hover lift matching DESIGN.md spec:

```css
.feature-card:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

Also add transition for smoothness:
```css
.feature-card {
  transition: box-shadow 0.15s ease, transform 0.15s ease;
  cursor: default;
}
```

## Why It Matters

DESIGN.md: "Hover-lift — interaction should feel physical." The feature cards are the first content below the hero — visitors scroll to them immediately. Dead cards feel unfinished compared to everything else on the page that lifts.

## Verification

Hover over each of the 4 feature cards. They should lift with shadow growth + translate. Compare to plan-card hover on pricing section below.
