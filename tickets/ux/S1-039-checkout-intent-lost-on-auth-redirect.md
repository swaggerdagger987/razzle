---
id: S1-039
severity: S1
confidence: HIGH
category: ux
source: DQ-351+DQ-416
status: OPEN
---

# Checkout intent lost when unauthenticated user clicks Pro/Elite CTA

## Root Cause (file:line)

**Intent save** — `frontend/app.js:1228-1232`:
```javascript
var token = localStorage.getItem("razzle_token");
if (!token) {
  try { sessionStorage.setItem("razzle_pending_checkout", interval || "year"); } catch(_) {}
  openAuthModal();
  return;
}
```
The intent IS saved to `sessionStorage` at line 1230. The mechanism exists.

**Intent resume** — `frontend/app.js:1075-1083`:
```javascript
function _resumePendingCheckout() {
  try {
    var pending = sessionStorage.getItem("razzle_pending_checkout");
    if (pending) {
      sessionStorage.removeItem("razzle_pending_checkout");
      if (typeof _showToast === 'function') _showToast('heading to checkout...', 'info');
      setTimeout(function() { startCheckout(pending); }, 500);
    }
  } catch(_) {}
}
```
The resume function exists. **The bug is: where is `_resumePendingCheckout()` called?**

Search shows it's called from `_detectCheckoutReturn()` context and possibly `DOMContentLoaded` or auth success handler. If it's NOT called after successful sign-in (auth modal close), the intent is saved but never acted on until the next page load.

**Actual gap**: The `_resumePendingCheckout()` must be called in the auth success callback (after `checkAuth()` returns a valid user). If the auth modal's success handler doesn't call it, the user signs in → modal closes → nothing happens → they must re-click.

## Fix

1. Ensure `_resumePendingCheckout()` is called immediately after successful authentication in the auth modal's submit handler
2. Add a toast: "Sign in to upgrade to Pro" when unauthenticated users click Pro CTAs outside pricing page

## Files to Change

- `frontend/app.js:1075-1083` — `_resumePendingCheckout()` must be called after auth success
- `frontend/app.js` — auth modal success handler (search for register/login success callback)

## Acceptance Criteria

1. Unauthenticated user clicks "Get Pro" → auth modal → signs in → Stripe checkout opens automatically
2. Intent survives the auth flow without user re-clicking
3. Lab "Get Pro" button shows explanation toast for unauthenticated users
4. If user closes auth modal without signing in, intent is cleared
