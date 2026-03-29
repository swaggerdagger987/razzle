# S1-010: Stripe webhook only handles 4 of 8+ critical events

**Severity**: S1 (High)
**Category**: billing
**Source**: 2026-03-14-launch-review.md P1-3
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`backend/billing.py` handles only 4 webhook events:
- `checkout.session.completed` (line 375)
- `customer.subscription.updated` (line 377)
- `customer.subscription.deleted` (line 379)
- `invoice.payment_failed` (line 381)

Missing events that will cause tier desync or revenue loss:
- `invoice.paid` — recurring payment success not confirmed; user could lose access if payment succeeds but Razzle doesn't process it
- `charge.dispute.created` — chargebacks go undetected; Stripe can freeze the account
- `charge.refunded` — refunded users keep paid access
- `customer.subscription.paused` — paused subscriptions keep active tier

## Fix

Add handlers in `backend/billing.py` for at minimum:

```python
elif event_type == "invoice.paid":
    # Confirm subscription is active, update users.plan if needed
elif event_type == "charge.dispute.created":
    # Log dispute, optionally downgrade user, alert admin
elif event_type == "charge.refunded":
    # Downgrade user plan to free
elif event_type == "customer.subscription.paused":
    # Set users.plan = 'free' until resumed
```

## Files to Change

- `backend/billing.py` — add 4 new event handlers in the webhook dispatch block (around lines 375-385)

## Accept When

1. `billing.py` handles at least 7 webhook event types
2. `invoice.paid` confirms active subscription
3. `charge.refunded` downgrades user to free
4. `charge.dispute.created` logs the dispute
5. Existing tests still pass
