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

`frontend/app.js` `openManageSubscription()` calls `/api/billing/portal` which requires a `stripe_customer_id` in the users table. If a user:

- Paid through a promo flow that didn't save the customer ID
- Had their customer ID cleared by a database migration
- Subscribed via a manual/admin process

They see an error when trying to manage their subscription. No fallback — they can't cancel, update payment, or view invoices.

Additionally (DQ-369), the "Manage Subscription" link appears inconsistently — sometimes in the nav dropdown, sometimes only on the pricing page banner. Paid users may not find it.

## Fix

1. `/api/billing/portal` should handle missing `stripe_customer_id` gracefully — return a helpful error message with support contact info instead of a generic error
2. Add a "Manage Subscription" link consistently to both the nav dropdown (for paid users) and the pricing page
3. If `stripe_customer_id` is missing, show: "Contact support to manage your subscription" with an email link

## Files to Change

- `backend/server.py` or `backend/billing.py` — portal endpoint error handling
- `frontend/app.js` — `openManageSubscription()` error display
- `frontend/app.js` — nav dropdown for paid users

## Acceptance Criteria

1. Paid user without `stripe_customer_id` sees helpful message instead of generic error
2. "Manage Subscription" link appears in nav dropdown for all paid users
3. Error message includes contact information
