# DES-326: pricing.html border-radius:13px — orphan token value

**Priority**: P3
**Area**: pricing.html (line ~41)
**Cycle**: 30

## Problem

The pricing page has a border-radius value that doesn't match any design token:

```css
border-radius: 13px;
```

DESIGN.md defines three border-radius tokens:
- `--radius-sm` = 8px (inputs, small badges)
- `--radius` = 12px (cards, containers — the default)
- `--radius-lg` = 20px (pills, chips, agent badges)

13px is 1px above the default `--radius` (12px). It's close enough to look intentional but doesn't match any token. This creates a situation where the pricing page cards have subtly different corner rounding than every other card on the site.

## Fix

Replace `border-radius: 13px` with `border-radius: var(--radius)` (12px):

```css
border-radius: var(--radius);
```

The 1px difference is imperceptible but the token alignment matters for consistency.

## Why This Matters

DES-016 (border-radius ungoverned), DES-038 (10px orphan), DES-039 (16px orphan) all addressed the same class of issue. This 13px instance was missed because it's only 1px off — but that's exactly the kind of "almost right" that accumulates into design drift.
