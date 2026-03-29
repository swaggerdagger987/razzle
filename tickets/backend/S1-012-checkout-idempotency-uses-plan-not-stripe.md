---
id: S1-012
severity: S1
category: billing
finding_ref: EDGE-11
confidence: MEDIUM
---

# S1-012: Checkout idempotency check uses users.plan, not Stripe subscription state

## Root Cause

`backend/billing.py:241-245`:
```python
raw_plan = user.get("raw_plan", user.get("plan", "free"))
if raw_plan in ("pro", "elite", "pro_lifetime", "elite_lifetime"):
    return {"error": "You already have an active subscription...", "status": 400}
```

This check prevents double-billing ONLY if the user's plan has already been updated
in the DB. But there's a race window:

1. User clicks "Subscribe" → checkout session A created → Stripe subscription S1 pending
2. Before webhook fires and updates `users.plan`, user clicks "Subscribe" again
3. `users.plan` still = "free" → checkout session B created → Stripe subscription S2
4. Both webhooks fire → user has two active Stripe subscriptions

The check should also query the `subscriptions` table for any row with
`status IN ('active', 'trialing')` for this user_id.

## What to Fix

In `billing.py`, before creating a checkout session, add a secondary check:

```python
# After the plan check at line 245, add:
conn = get_users_conn()
row = conn.execute(
    "SELECT id FROM subscriptions WHERE user_id = ? AND status IN ('active', 'trialing') LIMIT 1",
    (user["id"],)
).fetchone()
conn.close()
if row:
    return {"error": "You already have an active subscription.", "status": 400}
```

## Files to Change

- `backend/billing.py` — Add subscriptions table query before checkout session creation

## Acceptance Criteria

- [ ] Creating a checkout session checks BOTH `users.plan` AND `subscriptions` table
- [ ] If any active/trialing subscription exists in DB, return 400
- [ ] Race window reduced to webhook-to-DB-write latency (milliseconds, not seconds)

## Do NOT

- Do not add Stripe API calls here (too slow for request path)
- Do not remove the existing plan check — keep both as defense in depth
