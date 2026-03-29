# S0-004: Early adopter slot race condition (no DB reservation)

**Severity**: S0 (Critical)
**Category**: billing
**Source**: EDGE-CASES.md #10
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`backend/billing.py:122-138` (count) and `billing.py:250-258` (validation) — Early adopter slot checking is done with a `SELECT COUNT(*)` followed by a checkout creation. No atomic reservation.

```python
# billing.py:122-138
def get_subscriber_counts() -> dict:
    with auth_module.get_users_db() as conn:
        pro_count = conn.execute(
            "SELECT COUNT(*) FROM users WHERE plan IN ('pro', 'pro_lifetime')"
        ).fetchone()[0]
        # ...

# billing.py:254-258
counts = get_subscriber_counts()
if "elite" in interval and counts["elite_total"] >= EA_ELITE_LIMIT:
    return {"error": "Early adopter Elite spots are full", "status": 400}
```

Between the count check and the checkout completion (which happens asynchronously via Stripe webhook), multiple users can pass the limit check simultaneously and all complete checkout — exceeding the advertised cap.

## Fix

Use a database-level reservation pattern:

```python
# In create_checkout_session():
with auth_module.get_users_db() as conn:
    # Atomic: INSERT reservation if under limit
    conn.execute("""
        INSERT INTO ea_reservations (user_id, tier, created_at, expires_at)
        SELECT ?, ?, CURRENT_TIMESTAMP, datetime('now', '+30 minutes')
        WHERE (SELECT COUNT(*) FROM users WHERE plan IN ('pro', 'pro_lifetime'))
              + (SELECT COUNT(*) FROM ea_reservations WHERE tier='pro' AND expires_at > CURRENT_TIMESTAMP)
              < ?
    """, (user_id, tier, EA_PRO_LIMIT))
    if conn.total_changes == 0:
        return {"error": "Early adopter spots are full", "status": 400}
```

Reservations expire after 30 minutes (Stripe checkout timeout). Webhook clears reservation on completion.

## Files to Change

- `backend/billing.py:122-258` — replace count-then-check with atomic reservation
- `backend/auth.py` — add `ea_reservations` table to schema

## Accept When

1. Two concurrent checkout requests for the last slot: only one succeeds, the other gets "spots full"
2. Abandoned checkouts (user closes Stripe page) release the reservation after 30 minutes
3. Completed checkouts clear the reservation and update `users.plan`

## Do NOT Touch

- Stripe checkout flow logic — only the pre-check needs to be atomic
- `get_subscriber_counts()` for display purposes — that can stay as-is for the pricing page counter
