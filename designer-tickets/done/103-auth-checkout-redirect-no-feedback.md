<!-- PM: ready -->
# DQ-409: Auth → Checkout Redirect Has No User Feedback

**Priority**: P1 (conversion funnel breakage)
**Category**: Conversion Path
**Page**: pricing.html + app.js

## Problem

After a user registers (~line 1014 in app.js) or logs in (~line 977), if they came from a pricing CTA, `_resumePendingCheckout()` fires and silently redirects to Stripe after ~500ms (line ~1028). The user sees no toast, no loading indicator, no "redirecting to checkout..." message.

The experience: user fills out registration form → form closes → page sits idle for 500ms → suddenly redirects to Stripe. The user may think registration failed and click again, or close the tab during the delay.

## Fix

Add a toast before the Stripe redirect:
```javascript
_showToast('heading to checkout...', 'info');
```

This gives the user confidence that their registration worked and the redirect is intentional.

## Evidence

- Line ~1028 in app.js: `_resumePendingCheckout()` called after register
- Line ~1014: registration success handler — no visual feedback between register and redirect
- Stripe redirect happens after arbitrary delay with no loading state
