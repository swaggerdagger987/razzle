# S0-001: Payment failure doesn't revoke user plan access

**Severity**: S0 (Critical)
**Category**: billing
**Source**: EDGE-CASES.md #7
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`backend/billing.py:526-546` — `_handle_payment_failed()` updates `subscriptions.status` to `'payment_failed'` but does NOT update `users.plan`. Users retain full Pro/Elite access indefinitely after card decline.

```python
# billing.py:526-546
def _handle_payment_failed(invoice):
    # ...
    conn.execute("""
        UPDATE subscriptions SET status = 'payment_failed', updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
    """, (row["id"],))
    # BUG: users.plan is NEVER downgraded here
```

The code has a comment saying "Stripe retries failed payments multiple times" so it defers downgrade to `_handle_subscription_deleted`. But if Stripe's retry cycle takes days, the user keeps full access the entire time. And if the `subscription.deleted` webhook fails (cold start, network), access is permanent.

## Fix

After marking subscription as `payment_failed`, set a grace period (e.g., 3 days). After grace period expires, downgrade `users.plan` to `"free"`. Add a `payment_failed_at` timestamp column to `subscriptions` table, and check it in `require_plan()`.

Alternatively, add a reconciliation check in `require_plan()`:
```python
# In require_plan() or getUserPlan():
if subscription.status == 'payment_failed' and subscription.updated_at < (now - 3 days):
    downgrade user.plan to 'free'
```

## Files to Change

- `backend/billing.py:526-546` — add plan downgrade or grace period logic
- `backend/auth.py` — add `payment_failed_at` column to subscriptions schema if needed

## Accept When

1. After `invoice.payment_failed` webhook fires, user retains access for a configurable grace period (default 3 days)
2. After grace period, `users.plan` is set to `"free"`
3. If `invoice.paid` fires during grace period, status reverts and plan stays active
4. Unit test: payment failure + grace period expiry = plan downgraded

## Do NOT Touch

- `_handle_subscription_deleted()` — that path still works and should remain as final fallback
- `_handle_checkout_completed()` — unrelated
