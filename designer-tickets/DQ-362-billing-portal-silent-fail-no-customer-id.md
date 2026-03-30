---
id: DQ-362
title: Billing portal unavailable for paid users without stripe_customer_id
priority: P2
category: conversion / billing
page: billing.py + app.js
cycle: 47
---

## Problem

In `billing.py` line 584, portal session creation is skipped if the user has no `stripe_customer_id`. The `portal_url` stays None (line 561). The frontend shows a generic "subscription management isn't available right now" toast.

```python
# Line 584 — only tries if customer ID exists
if user.get("stripe_customer_id") or (sub and sub["stripe_customer_id"]):
    # ...create portal
```

A paid user who ended up with `plan="pro"` but no `stripe_customer_id` (migration bug, manual admin override, trial-to-paid edge case) cannot access billing, cancel, or upgrade. The error message doesn't explain why or how to get help.

## Why this matters

A paying user who can't cancel their subscription is a legal and trust problem. This is a blocking UX failure for a revenue-generating user.

## Fix

1. Backend: if `plan != "free"` and `portal_url` is None, include `"portal_error": "no_customer"` in response
2. Frontend: show specific message: "Billing portal unavailable. Contact support at [email]" with a direct link
3. Optionally: auto-create a Stripe customer for users with paid plans but missing customer IDs

## Files
- `backend/billing.py` (lines 561, 584-594)
- `frontend/app.js` (billing status handler)
