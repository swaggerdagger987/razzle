---
id: DQ-351
title: Early Adopter / Lifetime checkout intent lost when user must authenticate first
priority: P1
category: conversion / checkout
page: pricing.html
cycle: 46
---

## Problem

When an unauthenticated user clicks "Claim Early Adopter" or "Go Lifetime", the overriding `handleCheckout` function (line 793) opens the auth modal but does NOT save checkout intent to sessionStorage.

The original `handleCheckout` (line 586-595) correctly saves to sessionStorage:
```js
try { sessionStorage.setItem('razzle_pending_checkout', interval); } catch(_) {}
```

But the override at line 793 skips this:
```js
handleCheckout = function(plan) {
    var token = localStorage.getItem('razzle_token');
    if (!token) {
      if (typeof openAuthModal === 'function') openAuthModal();
      return;  // ← intent lost. sessionStorage never written.
    }
```

After auth completes, `_resumePendingCheckout()` in app.js has nothing to resume. The user lands on the pricing page with no indication their checkout attempt was interrupted. They must manually find and re-click the Early Adopter or Lifetime button.

## Why this matters

Early Adopter and Lifetime are the highest-value checkout paths ($79-479). Losing the intent on auth redirect means the most motivated buyers experience the worst UX. On mobile, they may not even scroll back to find the promo section.

## Not a duplicate of

- DES-272: covers missing loading state on checkout button (different surface)
- DES-284: covers button text flash during Stripe redirect (different surface)

## Fix

Add sessionStorage write to the override at line 795:
```js
handleCheckout = function(plan) {
    var token = localStorage.getItem('razzle_token');
    if (!token) {
      try { sessionStorage.setItem('razzle_pending_checkout', plan); } catch(_) {}
      if (typeof openAuthModal === 'function') openAuthModal();
      return;
    }
```

## Files
- `frontend/pricing.html` (line 793-806)
