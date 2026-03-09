# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## TICKET 1: Stripe Integration — $240/yr Subscription

**Phase Name**: Stripe Integration — Subscriptions and Payment
**Exit Criterion**: Users can subscribe to Razzle Pro ($240/year or $20/month) via Stripe Checkout. Successful payment updates user plan to 'pro' in users.db. Webhook handles subscription events (created, cancelled, payment failed). Pro users see full War Room content. Cancelled users downgrade to free. Deployed to Render.

### Task 1: Backend Stripe endpoints + webhook
**Requirement**: "Add Stripe integration to the backend: (a) Add stripe to requirements.txt. (b) Read STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET from environment variables. (c) Add POST /api/billing/create-checkout endpoint (requires auth): creates a Stripe Checkout Session for the current user. Include two price options: $240/year (default) and $20/month. Set success_url to https://razzle.lol/agents?session_id={CHECKOUT_SESSION_ID}. Set cancel_url to https://razzle.lol/agents. Store stripe_customer_id on the user record after first checkout. (d) Add POST /api/billing/webhook endpoint (no auth — Stripe calls this directly): verify webhook signature using STRIPE_WEBHOOK_SECRET. Handle events: checkout.session.completed → update user plan to 'pro' and store subscription_id. customer.subscription.deleted → update user plan to 'free'. invoice.payment_failed → flag user for follow-up. (e) Add GET /api/billing/status endpoint (requires auth): returns current user's plan, subscription status, next billing date, and a Stripe Customer Portal URL for managing subscription. (f) Add subscriptions table to users.db: user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end."
**Accept when**:
- POST /api/billing/create-checkout returns a Stripe Checkout URL
- Checkout session includes yearly and monthly price options
- Webhook correctly handles checkout.session.completed (upgrades to pro)
- Webhook correctly handles subscription.deleted (downgrades to free)
- GET /api/billing/status returns current plan info
- Stripe Customer Portal URL works for managing subscription
- All Stripe keys read from environment variables (never hardcoded)
**Depends on**: none
**Size**: L

### Task 2: Frontend upgrade flow + billing UI
**Requirement**: "Add subscription UI to the frontend: (a) On the War Room page (agents.html), the existing paywall blur should show an 'Upgrade to Pro' button for free-plan users. Clicking it calls POST /api/billing/create-checkout and redirects to Stripe Checkout. (b) After successful payment, user is redirected back to /agents with plan='pro'. The paywall blur should be gone and full War Room content visible. (c) Add a 'Manage Subscription' link in the user dropdown (when logged in as pro). Clicking it calls GET /api/billing/status and redirects to the Stripe Customer Portal. (d) Show plan badge next to username in nav: 'Free' (gray) or 'Pro' (terracotta/orange). (e) On the home page, add pricing info to the CTA section: 'Razzle Pro — $240/year ($20/month). Full league context. Agent memory. Personalized briefings.' with a 'Get Started' button that goes to register (if not logged in) or checkout (if logged in). (f) Follow Razzle design system for all billing UI."
**Accept when**:
- Upgrade button on War Room redirects to Stripe Checkout
- After payment, War Room content is fully accessible
- Manage Subscription link opens Stripe Customer Portal
- Plan badge shows in nav (Free vs Pro)
- Pricing CTA on home page
- Design system followed
**Depends on**: Task 1
**Size**: M

### Task 3: Deploy + smoke test Stripe integration
**Requirement**: "Verify Stripe integration works: (a) All JS passes syntax check. (b) All Python imports clean (stripe added to requirements.txt). (c) Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET env vars on Render. (d) Create Stripe products: 'Razzle Pro Annual' at $240/year and 'Razzle Pro Monthly' at $20/month. (e) Test checkout flow with Stripe test mode card (4242 4242 4242 4242). (f) Verify webhook updates user plan after successful payment. (g) Verify cancelled subscription downgrades user to free. (h) Pro users see full War Room, free users see paywall. Push to master."
**Accept when**: All syntax clean. Stripe test checkout works. Webhook processes events. Plan gating works. Committed and pushed to master.
**Depends on**: Tasks 1, 2
**Size**: S
