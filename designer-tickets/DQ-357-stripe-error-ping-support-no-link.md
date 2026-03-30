---
id: DQ-357
title: Stripe checkout error message says "ping support" with no support link or contact
priority: P2
category: UX / error recovery
page: app.js (all pages with checkout)
cycle: 46
---

## Problem

In app.js (around line 1189), when `startCheckout()` fails, the toast message says:

```
"checkout hit a wall. try again or ping support."
```

"Ping support" is an undefined action. There is no support link, no email address, no contact page reference. A user who encounters a Stripe error has no way to reach anyone.

## Why this matters

Checkout errors are the highest-stakes failure point. A user who was ready to pay $79.99/yr just hit a wall. The error message needs to give them a concrete next step, not a vague "ping support" with no target.

## Not a duplicate of

- DES-272: covers missing loading STATE on checkout button (visual feedback, not error copy)
- DES-284: covers button text flash during redirect (success path, not error path)

## Fix

Update the error message to include a concrete action:
```js
_showToast("checkout hit a wall. <a href='/about.html' style='color:var(--orange);text-decoration:underline;'>contact us</a> or try again.", 8000);
```

Or if a support email exists:
```js
_showToast("checkout hit a wall. email support@razzle.lol or try again.", 8000);
```

## Files
- `frontend/app.js` (startCheckout error handler, around line 1189)
