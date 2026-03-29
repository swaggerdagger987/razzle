---
id: S1-011
severity: S1
category: billing
finding_ref: EDGE-9
confidence: HIGH
---

# S1-011: No subscription reconciliation job — stale plans if webhook fails

## Root Cause

`backend/server.py:415-437` — The `lifespan()` function initializes tables and runs
`_background_bootstrap()` once at startup but creates no periodic background job.

`backend/billing.py` — Webhook handlers (`_handle_checkout_completed`,
`_handle_subscription_updated`, `_handle_subscription_deleted`, `_handle_payment_failed`)
are the ONLY mechanism that sync user plans with Stripe.

If a webhook delivery fails (Render cold start, network timeout, Stripe retry exhaustion),
the user's plan in `users.plan` becomes permanently stale — they keep paid access after
cancellation, or lose access after a successful renewal.

## What to Fix

Add a periodic reconciliation task that runs every 6 hours:

1. Query all users WHERE `plan` IN ('pro', 'elite') from `users.db`
2. For each, call `stripe.Subscription.retrieve(sub_id)` using the `stripe_subscription_id`
   stored in the `subscriptions` table
3. If Stripe says cancelled/past_due/unpaid, update `users.plan = 'free'`
4. If Stripe says active but users.plan is free, restore the correct plan
5. Log reconciliation results

Implementation options:
- `asyncio.create_task` in `lifespan()` with `asyncio.sleep(6*3600)` loop
- Or APScheduler (already lightweight, no extra deps needed for the built-in async scheduler)

## Files to Change

- `backend/server.py` — Add reconciliation background task in `lifespan()`
- `backend/billing.py` — Add `reconcile_subscriptions()` function

## Acceptance Criteria

- [ ] A background task runs every 6 hours after server startup
- [ ] Task queries Stripe for all active subscriptions and syncs plan state
- [ ] Mismatches are logged with user_id, expected plan, actual plan
- [ ] Task does not crash the server if Stripe API is unreachable (try/except with backoff)
- [ ] Unit test: mock Stripe API returning cancelled for an active-in-DB user → plan updated to free

## Do NOT

- Do not add new pip dependencies (use asyncio, not Celery)
- Do not reconcile on every request (too expensive)
- Do not modify webhook handlers — they still handle the happy path
