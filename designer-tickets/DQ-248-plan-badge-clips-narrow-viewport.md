---
id: DQ-248
priority: P3
category: mobile
page: pricing.html
---

# .plan-badge absolute positioning clips at narrow viewports

## What's wrong
The `.plan-badge` element uses:
```css
.plan-badge {
  position: absolute;
  top: -12px;
  right: 16px;
  ...
}
```

At 375px viewport width, the plan cards have `padding: 12px` (reduced from 24px). The badge extends 12px above the card boundary. Combined with the card's `overflow: visible` (default), the badge may visually collide with the card above it in the stacked mobile layout, or clip against the section padding.

## Fix
Add `overflow: visible` explicitly on `.plan-card` (to be safe), and at the 375px breakpoint adjust badge positioning:
```css
@media (max-width: 480px) {
  .plan-badge {
    top: -10px;
    right: 12px;
    font-size: 10px;
    padding: 2px 8px;
  }
}
```

Also add `margin-top: 16px` to stacked `.plan-card` elements on mobile to leave room for the badge.

## Files
- `frontend/pricing.html` or `frontend/styles.css` — `.plan-badge` mobile override
