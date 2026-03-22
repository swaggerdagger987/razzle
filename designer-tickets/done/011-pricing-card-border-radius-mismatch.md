---
id: DES-011
priority: P2
area: index.html + pricing.html
status: open
created: 2026-03-22
---

# DES-011: Pricing card border-radius mismatch — home page 12px vs pricing page 8px

## What's Wrong

The same conceptual component (pricing/plan card) uses different border-radius values:

- **Home page** `index.html:478` — `.pricing-card { border-radius: 12px; }`
- **Pricing page** `pricing.html:83` — `.plan-card { border-radius: 8px; }`

A user scrolling the home page sees rounded cards. They click "See full feature comparison" and arrive at the pricing page where the same cards have sharper corners. Subtle but undermines the "this is one polished product" impression.

## Why It Matters

The home-to-pricing transition is the #1 conversion path. Visual inconsistency between these two pages creates a subconscious "something changed" feeling that reduces trust. Users are making a $79-150/year decision — every detail matters.

## Fix

Standardize on one value. `var(--radius)` (12px) exists in `:root` — use it:

```css
/* pricing.html */
.plan-card {
  border-radius: var(--radius); /* was 8px */
}
```

Or if 8px is preferred, update both to match + the CSS variable.

## Files

- `frontend/index.html` — `.pricing-card` (line 478)
- `frontend/pricing.html` — `.plan-card` (line 83)
