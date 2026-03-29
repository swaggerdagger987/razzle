---
id: S1-039
severity: S1
confidence: HIGH
category: ux
source: DQ-351+DQ-416
status: OPEN
---

# Checkout intent lost when unauthenticated user clicks Pro/Elite CTA

## Root Cause

When an unauthenticated user clicks "Start Free Trial" or "Get Pro" on pricing.html or index.html:

1. `startCheckout()` checks auth, finds none, opens the auth modal
2. User registers/signs in
3. Auth modal closes, user is back on the page — but the checkout intent is gone
4. User must find and click the CTA again

The pricing page CTA flow is: click → auth modal → success → nothing happens. The user expected to land in Stripe checkout.

Additionally (DQ-416), the "Get Pro" button in the Lab sidebar silently opens the auth modal with no explanation — no toast saying "Sign in first to upgrade."

## Fix

1. Before opening auth modal, save checkout intent to `sessionStorage` (e.g., `razzle_checkout_intent = "pro_monthly"`)
2. After successful auth (in `checkAuth()` or auth modal close handler), check for saved intent and auto-trigger `startCheckout()` with the saved plan
3. For the Lab sidebar "Get Pro" button, show a toast: "Sign in to upgrade to Pro"

## Files to Change

- `frontend/app.js` — `startCheckout()`, auth modal close handler, `checkAuth()` post-login hook
- `frontend/pricing.html` — CTA onclick handlers

## Acceptance Criteria

1. Unauthenticated user clicks "Get Pro" → auth modal → signs in → Stripe checkout opens automatically
2. Intent survives the auth flow without user re-clicking
3. Lab "Get Pro" button shows explanation toast for unauthenticated users
4. If user closes auth modal without signing in, intent is cleared
