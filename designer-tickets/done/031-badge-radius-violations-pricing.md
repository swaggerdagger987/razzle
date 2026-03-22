# DES-031: Plan badge and save badge use sub-minimum border-radius on pricing page

**Priority**: P2
**Area**: pricing.html
**Impact**: Two elements on the pricing page (the conversion page) use border-radius values smaller than the design system's minimum token `--radius-sm` (8px). They feel sharp and out of place compared to the rest of the sticker aesthetic.

## The Problem

`frontend/pricing.html` line 93:
```css
.plan-badge {
  /* ... */
  border-radius: 4px;  /* ← should be var(--radius-sm) = 8px */
}
```

`frontend/pricing.html` line 49:
```css
.save-badge {
  /* ... */
  border-radius: 6px;  /* ← should be var(--radius-sm) = 8px */
}
```

Design system tokens:
- `--radius-sm`: 8px (inputs, small badges, pricing badges, info boxes)
- `--radius`: 12px (cards, containers)
- `--radius-lg`: 20px (pills, sticker-shaped)

4px and 6px are below the minimum. The DESIGN.md type scale explicitly lists "pricing badges" under `--radius-sm` (8px).

## The Fix

```css
.plan-badge {
  border-radius: var(--radius-sm);  /* 8px */
}
.save-badge {
  border-radius: var(--radius-sm);  /* 8px */
}
```

## Why This Matters

These badges ("POPULAR", "BEST VALUE", "Save 33%") are conversion nudges. They should match the sticker/badge aesthetic — slightly rounded, chunky, inviting. 4px feels corporate. 8px feels playful.
