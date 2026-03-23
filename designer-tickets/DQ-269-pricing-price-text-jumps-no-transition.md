---
id: DQ-269
title: Pricing page price text jumps abruptly when toggling Monthly/Yearly — no transition
priority: P3
category: polish
status: open
cycle: 36
---

## Problem

When users toggle the Monthly/Yearly switch on the pricing page, the toggle knob slides smoothly (`transition: transform 0.2s`), but the price text ($9.99 -> $79.99) changes via innerHTML with zero animation. The number just jumps. This creates a jarring disconnect — the toggle feels polished but the content it controls feels broken.

## Evidence

`frontend/pricing.html`:

Toggle has smooth transition (line ~46):
```css
.interval-toggle .toggle-knob { transition: transform 0.2s; }
```

But updatePricingUI() swaps text directly (line ~569):
```javascript
document.getElementById('proPrice').innerHTML = PRICES.pro.year + '<span>/yr</span>';
```

No opacity fade, no CSS transition class, no animation.

## Fix

Add a quick opacity fade on price change:

```javascript
function updatePricingUI() {
  var priceEls = document.querySelectorAll('.plan-price');
  priceEls.forEach(function(el) { el.style.opacity = '0'; });
  setTimeout(function() {
    // ... existing innerHTML updates ...
    priceEls.forEach(function(el) { el.style.opacity = '1'; });
  }, 150);
}
```

And in CSS:
```css
.plan-price { transition: opacity 0.15s ease; }
```

## Files
- `frontend/pricing.html` — updatePricingUI function + plan-price CSS

## Impact
Minor polish, but the pricing page is the conversion page. Every micro-interaction matters there.
