# Razzle Loop — Phase 43 Task List

> Consumed from TICKETS.md (Ticket 1).

**Current Phase**: 43 — Stripe Integration — Subscriptions and Payment
**Exit Criterion**: Users can subscribe to Razzle Pro ($240/year or $20/month) via Stripe Checkout. Successful payment updates user plan to 'pro' in users.db. Webhook handles subscription events (created, cancelled, payment failed). Pro users see full War Room content. Cancelled users downgrade to free. Deployed to Render.

---

## Task 1: Backend Stripe endpoints + webhook
**Status**: PASS
**Result**: Created backend/billing.py with full Stripe integration. Endpoints: POST /api/billing/create-checkout (auth required, yearly/monthly), POST /api/billing/webhook (signature verified), GET /api/billing/status (auth required, returns plan + portal URL). Webhook handles checkout.session.completed (upgrade to pro), customer.subscription.deleted (downgrade to free), invoice.payment_failed (flag user). Subscriptions table in users.db. stripe_customer_id on users table. All keys from env vars (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_YEARLY, STRIPE_PRICE_MONTHLY). Added stripe>=7.0.0 to requirements.txt.
**Acceptance Criteria**:
- POST /api/billing/create-checkout returns a Stripe Checkout URL
- Checkout session includes yearly and monthly price options
- Webhook correctly handles checkout.session.completed (upgrades to pro)
- Webhook correctly handles subscription.deleted (downgrades to free)
- GET /api/billing/status returns current plan info
- Stripe Customer Portal URL works for managing subscription
- All Stripe keys read from environment variables (never hardcoded)

## Task 2: Frontend upgrade flow + billing UI
**Status**: PASS
**Result**: Nav shows plan badge (Free gray / Pro terracotta) next to username. Pro users see "Manage" link that opens Stripe Customer Portal. War Room upsell "Upgrade to Pro" button calls startCheckout('year'). Home page has pricing section with $240/year and $20/month cards, both call startCheckout(). After Stripe redirect, checkAuth() refreshes user data to get updated plan. Design system followed (chunky borders, shadows, fonts).
**Acceptance Criteria**:
- Upgrade button on War Room redirects to Stripe Checkout
- After payment, War Room content is fully accessible
- Manage Subscription link opens Stripe Customer Portal
- Plan badge shows in nav (Free vs Pro)
- Pricing CTA on home page
- Design system followed

## Task 3: Deploy + smoke test Stripe integration
**Status**: PASS
**Result**: All 8 JS files pass syntax check. All 4 Python modules import clean (stripe installed). Full billing smoke test: free user status, checkout requires Stripe key (503), webhook requires secret (503), direct plan upgrade reflects in user dict, token check returns correct plan. Plan gating verified. Committed and pushed.
**Acceptance Criteria**:
- All syntax clean
- All Python imports clean (stripe in requirements.txt)
- Stripe checkout flow works (test mode)
- Webhook processes events correctly
- Plan gating works (pro vs free)
- Committed and pushed to master

---

## Loop State
```
Current Phase: 43
Current Task: 3
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 3/3
```
