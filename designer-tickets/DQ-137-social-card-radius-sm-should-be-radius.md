---
id: DQ-137
priority: P3
area: design-system
section: home-page
type: token-violation
status: open
---

# Home social-card uses --radius-sm (8px) but cards should use --radius (12px)

## What's wrong

`.social-card` on the home page (line 428) uses `border-radius: var(--radius-sm)` (8px). Per DESIGN.md:

- `--radius-sm` (8px): "Inputs, small badges, pricing badges, info boxes"
- `--radius` (12px): "Cards, containers, modals — the default"

The social proof cards are full-sized cards (3px border, 4px shadow, 16px padding) — they should use the default card radius, not the small badge radius.

## Where

- `frontend/index.html` line 428

## Fix

```css
.social-card {
  border-radius: var(--radius);  /* was var(--radius-sm) */
}
```

## Why this matters

When social cards use 8px and feature cards use 12px (line 331), cards on the same page have different corner roundness. This subtle inconsistency makes the page feel unpolished.
