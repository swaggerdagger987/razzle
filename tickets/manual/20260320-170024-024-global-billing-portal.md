---
id: 20260320-170024-024
severity: P1
confidence: HIGH
flow: global
flow_name: Global — Billing Portal via Stripe Customer Portal
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build self-serve billing portal for upgrade/downgrade via Stripe Customer Portal

**PRIORITY: P1** | **Type: structural**
**Page**: account.html or settings section
**Design doc**: docs/NORTH_STAR.md

Pro subscribers need a way to manage their subscription without emailing support. Integrate Stripe's Customer Portal to let users update payment methods, view invoices, switch plans, and cancel. The portal link should be accessible from the user's account section. The backend generates a Stripe Customer Portal session URL and redirects the user. No custom billing UI needed — Stripe handles the portal.

### Task 1: Implement Stripe Customer Portal integration
**Accept when**: Authenticated Pro users can click "Manage Subscription" from their account area and be redirected to Stripe's hosted Customer Portal. From there they can update payment method, view past invoices, and cancel their subscription. The backend endpoint `/api/billing/portal` creates a portal session and returns the URL. Cancellation updates the user's subscription status appropriately. Free users see "Upgrade to Pro" instead of "Manage Subscription."
