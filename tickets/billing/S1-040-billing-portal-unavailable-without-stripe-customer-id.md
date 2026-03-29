---
id: S1-040
severity: S1
confidence: HIGH
category: billing
source: DQ-362+DQ-369
status: OPEN
---

# Billing portal unavailable for paid users without stripe_customer_id

## Root Cause

`frontend/app.js` `openManageSubscription()` calls `/api/billing/status` which requires a `stripe_customer_id` in the users table. If a user:

- Paid through a promo flow that didn't save the customer ID
- Had their customer ID cleared by a database migration
- Subscribed via a manual/admin process

They see an error when trying to manage their subscription. No fallback — they can't cancel, update payment, or view invoices.

Additionally (DQ-369), the "Manage Subscription" link appears inconsistently — sometimes in the nav dropdown, sometimes only on the pricing page banner. Paid users may not find it.

## Root Cause (file:line)

**Frontend trigger** — `frontend/app.js:1322-1334`:
```javascript
var data = await resp.json();
if (data.portal_url) {
  window.location.href = data.portal_url;
} else {
  _showToast("subscription management isn't available right now.", "error");
}
```
When `portal_url` is null, the user sees a generic toast with no explanation or fallback.

**Backend portal generation** — `backend/billing.py:584-593`:
```python
if user.get("stripe_customer_id") or (sub and sub["stripe_customer_id"]):
    customer_id = user.get("stripe_customer_id") or sub["stripe_customer_id"]
    try:
        portal = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{_BASE_URL}/agents",
        )
        result["portal_url"] = portal.url
    except Exception as e:
        logger.error(f"Portal creation error: {e}")
```
If `stripe_customer_id` is missing from both tables, `portal_url` stays `None` (set at `billing.py:561`). The `except` at line 592 swallows Stripe API errors silently.

**Nav dropdown** — `frontend/app.js:1164-1165`: Shows "Manage Subscription" for paid non-trial users.

## Fix

1. `backend/billing.py:584-593` — return an error field when `stripe_customer_id` is missing
2. `frontend/app.js:1334` — show "Contact support to manage your subscription" with email link
3. `backend/billing.py:589` — portal `return_url` should be pricing page, not `/agents`

## Files to Change

- `backend/billing.py:561,584-593` — portal generation + error handling
- `frontend/app.js:1331-1334` — portal URL null handling

## Acceptance Criteria

1. Paid user without `stripe_customer_id` sees helpful message instead of generic error
2. "Manage Subscription" link appears in nav dropdown for all paid users
3. Error message includes contact information
