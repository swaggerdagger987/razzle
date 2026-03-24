---
id: DQ-369
title: Manage Subscription shown inconsistently between nav dropdown and pricing banner
priority: P3
category: UX / billing
page: app.js + pricing.html
cycle: 47
---

## Problem

The "Manage Subscription" link appears in two places with different visibility rules:

1. **Nav dropdown** (app.js line ~1111-1114): shown only if `isPaid && !isTrial` — trial users DON'T see it
2. **Pricing page banner** (pricing.html `subscribedBanner`): shown for any `plan !== "free"` — trial users DO see it

A trial user on the pricing page sees "Manage Subscription" in the banner but can't find it in the nav. A trial user browsing elsewhere has no "Manage" option visible at all. This inconsistency confuses users trying to understand their subscription status.

## Fix

Unify the visibility logic. Either:
- Show "Manage Subscription" for ALL paid users (including trial) in both locations — the Stripe portal handles trial users correctly
- OR show "Manage Subscription" only for non-trial paid users in BOTH locations, and show "View Trial Status" for trial users

## Files
- `frontend/app.js` (~line 1111-1114, nav dropdown)
- `frontend/pricing.html` (subscribedBanner section)
