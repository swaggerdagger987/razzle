---
id: S2-099
severity: S2
confidence: MEDIUM
category: billing
source: 2026-03-14-review.md (Early Adopter Counting Bug)
status: OPEN
---

# Early adopter slot count includes ALL pro/elite subscribers, not just EA subscribers

## Root Cause

`backend/billing.py:122-149` — `get_subscriber_counts()` counts ALL users with `plan IN ('pro', 'pro_lifetime')` for Pro slots and `plan IN ('elite', 'elite_lifetime')` for Elite slots. It does not distinguish between early adopter subscribers and regular-price subscribers.

```python
# billing.py:126-128
pro_count = conn.execute(
    "SELECT COUNT(*) FROM users WHERE plan IN ('pro', 'pro_lifetime')"
).fetchone()[0]
```

This count is used at `billing.py:250-258` to check if early adopter slots are still available. If 500 regular-price Pro users exist, the EA cap is "full" even though zero early adopter subscribers exist — blocking new EA signups.

**Related ticket:** S0-004 addresses the race condition in slot checking but its proposed fix uses the same flawed counting logic.

## Fix

Add a `price_id` or `is_early_adopter` column to track which subscribers used EA pricing:

**Option A**: Query the `subscriptions` table instead of `users` to check price_id:
```python
ea_pro_count = conn.execute(
    "SELECT COUNT(*) FROM subscriptions WHERE price_id LIKE '%ea_%' AND status = 'active'"
).fetchone()[0]
```

**Option B**: Add `is_early_adopter BOOLEAN DEFAULT 0` to users table, set during checkout:
```python
ea_pro_count = conn.execute(
    "SELECT COUNT(*) FROM users WHERE plan IN ('pro', 'pro_lifetime') AND is_early_adopter = 1"
).fetchone()[0]
```

Also update S0-004's proposed fix to use the corrected count.

## Files to Change

- `backend/billing.py:122-149` — fix `get_subscriber_counts()` to count only EA subscribers for cap checking
- `backend/billing.py:250-258` — use EA-specific count for slot validation
- `backend/billing.py` (webhook handler) — mark users as early_adopter when they complete EA checkout

## Accept When

1. EA slot check counts only early-adopter-priced subscribers, not all subscribers
2. Regular-price subscribers do not consume EA slots
3. EA cap still enforced correctly for actual EA signups
4. Pricing page still shows correct remaining EA slots

## Do NOT Touch

- Stripe checkout flow (price selection logic)
- Display counts on pricing page (can show total subscribers separately from EA slots)
