---
id: DQ-367
title: Promo code Apply button not disabled during validation API call
priority: P3
category: UX / pricing
page: pricing.html
cycle: 47
---

## Problem

In `pricing.html` (lines 616-656), the `validatePromoCode()` function calls `/api/billing/validate-promo` but does not disable the Apply button while the request is in flight. A user can click "Apply" multiple times, causing:

1. Duplicate network requests
2. Race condition if responses arrive out of order
3. Flashing feedback text as each response overwrites the previous

## Fix

Disable the Apply button and show "Validating..." during the fetch. Re-enable on success or error:

```js
async function validatePromoCode() {
  var btn = document.getElementById("promoApplyBtn");
  btn.disabled = true;
  btn.textContent = "Validating...";
  try {
    // ... existing fetch logic
  } finally {
    btn.disabled = false;
    btn.textContent = "Apply";
  }
}
```

## Files
- `frontend/pricing.html` (lines 616-656, `validatePromoCode`)
