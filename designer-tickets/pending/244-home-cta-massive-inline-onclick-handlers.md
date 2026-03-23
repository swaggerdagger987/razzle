# DES-244: Home page CTA buttons have 80+ character inline onclick handlers

**Priority:** P2 — code fragility on conversion path
**Page:** index.html lines 822, 839
**Cycle:** 23

## Problem

The "Get Pro" and "Get Elite" CTA buttons on the home page pricing section contain massive inline `onclick` attributes:

Line 822 (Get Pro):
```html
onclick="var u=null;try{u=JSON.parse(localStorage.getItem('razzle_user'))}catch(e){}if(!u){try{sessionStorage.setItem('razzle_pending_checkout','pro_year')}catch(x){}if(typeof openAuthModal==='function')openAuthModal();else window.location='/pricing.html'}else if(typeof startCheckout==='function'){startCheckout('pro_year')}else{window.location='/pricing.html'}"
```

Line 839 (Get Elite): Same pattern with `elite_year`.

These handlers:
- Check localStorage for auth state
- Store checkout intent in sessionStorage
- Call `openAuthModal()` if available
- Fall back to `/pricing.html` redirect
- Or call `startCheckout()` if user is logged in

This logic is duplicated in pricing.html's `handleCheckout()` function. Any bug fix to one must be replicated in the other. The inline handlers also can't be tested, debugged with breakpoints, or updated without editing raw HTML strings.

## Fix

Move the checkout logic to the `<script>` block at line 917+ where `_updateHomeCTAs()` already exists:

```javascript
document.getElementById('homeProCta').addEventListener('click', function() {
  handleCheckout ? handleCheckout('pro') : (window.location = '/pricing.html');
});
```

The auth check and sessionStorage logic already exist in `handleCheckout()` and `startCheckout()` in app.js — no need to duplicate.

## Why this matters

These are the two highest-value buttons on the site — they initiate the checkout flow. Inline onclick handlers are fragile: if `openAuthModal` fails to load (script error, slow network), the fallback silently redirects to pricing instead of showing the error. Moving to addEventListener with the existing helper functions makes the conversion path testable and maintainable.
