---
id: DES-012
priority: P2
area: index.html (home page)
status: open
created: 2026-03-22
---

# DES-012: Box-shadow inconsistency — social-card and smart-chip use 3px instead of design-spec 4px

## What's Wrong

DESIGN.md specifies card box shadows as `4px 4px 0 var(--ink)`. Two home page components use smaller shadows:

1. `.social-card` (line 418) — `box-shadow: 3px 3px 0 var(--ink);`
2. `.smart-chip` (line 352) — `box-shadow: 3px 3px 0 var(--ink);`

Meanwhile, adjacent components on the same page use the correct 4px:
- `.feature-card` — `4px 4px 0`
- `.pricing-card` — `4px 4px 0`
- `.screener-visual-card` — `6px 6px 0`

The inconsistency is visible when scrolling — feature cards and pricing cards feel chunky, while social proof cards and filter chips feel thin by comparison.

## Why It Matters

"Chunky borders and offset shadows" is the #1 design principle. The home page is the first impression. Mixed shadow sizes undermine the visual consistency that makes Razzle feel intentional.

## Fix

Update both to `4px 4px 0 var(--ink)`:

```css
.social-card {
  box-shadow: 4px 4px 0 var(--ink); /* was 3px */
}

.smart-chip {
  box-shadow: 4px 4px 0 var(--ink); /* was 3px */
}
```

Also update their hover states to `5px 5px 0` or `6px 6px 0` for the lift effect (currently smart-chip hover goes to 4px — should go to 6px to match design spec hover lift).

## Files

- `frontend/index.html` — `.social-card` (line 418), `.smart-chip` (line 352)
