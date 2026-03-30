# DES-245: Promo code Easter eggs siloed to pricing.html only

**Priority:** P2 — UX consistency
**Page:** pricing.html lines 610-614, app.js
**Cycle:** 23

## Problem

pricing.html defines three Easter egg promo codes with personality responses:

```javascript
var EASTER_EGG_CODES = {
    'RAZZLEDAZZLE': "now THAT's a football name. 10% off? ...nah, but you earned our respect.",
    'TIGER': 'Razzle approves. no discount, but have a tiger paw: 🐾',
    'GOAT': "that's what they call Razzle around the office."
};
```

These are checked client-side in `validatePromoCode()` (pricing.html:616) BEFORE the server-side `/api/billing/validate-promo` call. If the code matches an Easter egg, the personality response is shown and no server call is made.

app.js has its own `validatePromoCode()` (line 1211+) that calls `/api/billing/validate-promo` directly without checking Easter eggs. If a promo code input is ever added to a non-pricing page (e.g., the upgrade gate modal), Easter egg codes won't trigger.

## Fix

Move Easter egg codes to app.js so they're available sitewide:

```javascript
var EASTER_EGG_CODES = {
    'RAZZLEDAZZLE': "now THAT's a football name. 10% off? ...nah, but you earned our respect.",
    'TIGER': 'Razzle approves. no discount, but have a tiger paw: 🐾',
    'GOAT': "that's what they call Razzle around the office."
};
```

Check Easter eggs before the API call in app.js's `validatePromoCode()`.

## Why this matters

Easter eggs are brand personality — exactly what makes Razzle feel different from FantasyPros or KeepTradeCut. Personality should work everywhere, not just on one page. Low effort, high delight.
