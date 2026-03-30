---
id: DQ-350
title: Pricing promotional cards have no expiration check or sold-out fallback UX
priority: P2
category: UX / edge case
page: pricing.html
cycle: 45
---

## Problem

The pricing page loads promotional pricing from `/api/billing/promotions` (line 730) and renders Early Adopter and Lifetime cards. Three edge cases have no UX handling:

1. **Sold out (0 remaining)**: If `ea.pro.remaining` = 0, the card still renders showing "0 of 100 spots left" with an active "Claim Early Adopter" button. Clicking it would fail silently or show a Stripe error.

2. **Promotion expired**: No client-side date check. If the API returns `enabled: true` for an expired promo (server bug or cached response), users see a promotion they can't actually use.

3. **API error on promotions**: The catch block (line 786) silently swallows errors. If the API is down, users see no promotional section at all — acceptable. But if the API returns malformed JSON, `ea.pro.price` could be undefined, rendering "undefined" in the card.

## Evidence

```javascript
// Line 738-739: no check for remaining > 0
if (ea && ea.enabled) {
    if (ea.pro.available) {  // "available" may be true even with 0 remaining
```

## Fix

Add guard conditions:
```javascript
if (ea.pro.available && ea.pro.remaining > 0) {
    // ... render card
}
// After all cards, if ea.enabled but all sold out:
if (ea.enabled && !ea.pro.available && !ea.elite.available) {
    cards.push('<div class="promo-card"><div class="promo-card-title">Early Adopter — Sold Out</div><div style="font-family:var(--font-hand); color:var(--ink-light);">all spots claimed</div></div>');
}
```

## Files
- `frontend/pricing.html` (lines 737-758)
