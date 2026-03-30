# DES-044: Pricing page promo input and free-chip use sub-token border-radius

**Priority**: P2
**Area**: pricing.html (conversion page)
**Impact**: The promo code input field uses `border-radius: 4px` and the free-chip badge uses `border-radius: 6px`. Both are below the design system minimum `--radius-sm` (8px). These are on the pricing page — the decision point for conversion.

## The Problem

`pricing.html` line 126:
```css
.promo-row input {
  border-radius: 4px;  /* ← should be var(--radius-sm) = 8px */
}
```

`pricing.html` line 160:
```css
.free-chip {
  border-radius: 6px;  /* ← should be var(--radius-sm) = 8px */
}
```

DESIGN.md token table explicitly says `--radius-sm` (8px) is for "inputs, small badges, pricing badges." These are literally inputs and pricing badges on the pricing page.

## The Fix

```css
.promo-row input {
  border-radius: var(--radius-sm);  /* 8px */
}
.free-chip {
  border-radius: var(--radius-sm);  /* 8px */
}
```

## Why This Matters

The pricing page is where users decide to pay. The DESIGN.md spec says "inputs" and "pricing badges" use `--radius-sm`. These elements are inputs and pricing badges. On a page where every visual detail contributes to the "trust this product" impression, following the design spec exactly is non-negotiable.
