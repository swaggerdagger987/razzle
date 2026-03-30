---
id: DES-272
title: Pricing checkout buttons have no visible loading state during Stripe API call
priority: P2
page: pricing.html, index.html
category: conversion-ux
cycle: 26
---

## Problem

When a user clicks "Get Pro" or "Get Elite" on pricing.html (lines 293, 316) or index.html (lines 822, 839), `handleCheckout()` calls `startCheckout()` in app.js (line 1155) which makes an async fetch to `/api/billing/create-checkout`. The `_checkoutInProgress` flag prevents double-clicks, but there is NO visual indicator that anything is happening.

The user clicks the button, sees no change for 1-3 seconds (API call + Stripe redirect), then suddenly leaves the page. On slow mobile connections, this gap feels like a broken button.

## Evidence

- pricing.html:293 — `<button class="btn-primary" onclick="handleCheckout('pro')">Get Pro</button>` (no loading state)
- app.js:1155-1200 — `startCheckout()`: sets `_checkoutInProgress = true` but never updates button text, never disables button, never shows spinner
- app.js:1183-1192 — async fetch to create-checkout, then `window.location.href = data.url` redirect
- The auth modal's `handleLogin()` (app.js:960) correctly shows a disabled state: `btn.disabled = true; btn.textContent = 'signing in...'` — the checkout flow should follow the same pattern

## Fix

In `startCheckout()` after setting `_checkoutInProgress = true`:
1. Find the clicked button (pass it as param or use `document.activeElement`)
2. Disable it and change text: `btn.disabled = true; btn.textContent = 'opening checkout...'`
3. On error, restore: `btn.disabled = false; btn.textContent = originalText`

## Why This Matters

The checkout button click is the highest-stakes UX moment. Users who think the button is broken will leave. Users who click repeatedly (despite the flag) feel frustrated. A loading state costs 3 lines of code and signals "we got your click."
