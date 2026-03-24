---
id: DQ-346
title: Pricing promotional cards built entirely with inline styles (40+ lines)
priority: P3
category: CSS hygiene
page: pricing.html
cycle: 45
---

## Problem

The pricing page promotional cards (Early Adopter + Lifetime) are built in JavaScript (lines 740-779) with ALL styling as inline `style=""` attributes. Each card has 6-8 inline style properties. With 4 possible cards, that's ~30 inline style declarations.

```javascript
// Line 740-746 — one card, all inline
'<div style="background:var(--bg-card); border:3px solid var(--orange); border-radius:var(--radius); box-shadow:4px 4px 0 var(--ink); padding:16px 20px; text-align:center;">' +
  '<div style="font-family:var(--font-mono); font-size:14px; margin-bottom:4px;">Early Adopter Pro</div>' +
  '<div style="font-family:var(--font-display); font-size:28px; color:var(--orange);">' + esc(ea.pro.price) + '</div>' +
  // ...
```

Problems:
1. Cannot be overridden by CSS classes (specificity)
2. Cannot be themed in dark mode without JS changes
3. font-size:28px is off-spec (DQ-078 covers this but these are new instances)
4. No hover/focus states possible on inline-styled elements

## Fix

Create a `.promo-card` CSS class in the pricing page styles:
```css
.promo-card { background: var(--bg-card); border: 3px solid var(--ink); border-radius: var(--radius); box-shadow: 4px 4px 0 var(--ink); padding: 16px 20px; text-align: center; }
.promo-card--orange { border-color: var(--orange); }
.promo-card--purple { border-color: var(--purple); }
.promo-card--green { border-color: var(--green); }
.promo-card-title { font-family: var(--font-mono); font-size: 14px; margin-bottom: 4px; }
.promo-card-price { font-family: var(--font-display); font-size: 32px; }
.promo-card-meta { font-family: var(--font-mono); font-size: 11px; color: var(--ink-light); }
```

Then replace inline styles with class names in JS.

## Files
- `frontend/pricing.html` (lines 740-779)
