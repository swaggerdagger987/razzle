# DES-024: Pricing cards grid too cramped at tablet widths (768-900px)

**Priority**: P2
**Area**: pricing.html
**Impact**: Pricing page — the conversion page — stacks cards at 900px. Between 768px and 900px (iPad portrait), three pricing cards try to squeeze into ~720px, making each card ~240px wide. Cards are designed for 300px+ minimum content. Text wraps awkwardly, feature lists compress, and the page looks cramped at the exact viewport size where iPad users browse.

## The Problem

`frontend/pricing.html` line 55:
```css
@media (max-width: 900px) {
  .plans-grid { grid-template-columns: 1fr !important; }
}
```

The jump is too sudden — from 3 columns to 1 column at 900px. Between 768px and 899px, cards squeeze into 3 columns and look bad. Below 900px they jump straight to single column, which wastes horizontal space on tablets.

## The Fix

Add intermediate breakpoint:
```css
@media (max-width: 900px) {
  .plans-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .plans-grid { grid-template-columns: 1fr; }
}
```

This gives tablets a clean 2-column layout (Free+Pro side by side, Elite below) before stacking to 1 column on phones.

## Why This Matters

Pricing page is the conversion page. iPad is a common browsing device for the 22-40 demographic. If the pricing comparison looks cramped and hard to compare, users won't convert.
