---
id: DQ-179
priority: P2
category: code-quality/ux
status: open
cycle: 26
---

# Home page Pro/Elite CTA buttons have 10+ line inline onclick handlers

## What's wrong

The "Get Pro" and "Get Elite" buttons on the home page have massive inline `onclick` attributes with 10+ lines of JavaScript logic including localStorage parsing, conditional auth modal opening, and Stripe checkout URL construction. This creates:
- Unmaintainable code (logic buried in HTML attributes)
- No error handling if localStorage throws or JSON.parse fails
- Buttons that silently fail if any part of the inline chain breaks
- Cannot be tested or debugged easily

## Where

- `frontend/index.html:822` — Get Pro button
- `frontend/index.html:839` — Get Elite button

## Code (truncated)

```html
<button id="homeProCta" ... onclick="var u=null;try{u=JSON.parse(localStorage.getItem('razzle_user'))}catch(e){}if(!u){...openAuthModal...}else{window.location.href='/api/stripe/create-checkout-session?plan=pro_yearly&email='+...}">Get Pro</button>
```

## Fix

Move the logic to a named function in app.js:

```javascript
function handlePlanCTA(plan) {
  const user = getStoredUser(); // already exists in app.js
  if (!user) {
    openAuthModal('register', plan);
    return;
  }
  window.location.href = `/api/stripe/create-checkout-session?plan=${plan}&email=${encodeURIComponent(user.email)}`;
}
```

Replace inline handlers with `onclick="handlePlanCTA('pro_yearly')"` and `onclick="handlePlanCTA('elite_yearly')"`.

## Test

1. Click "Get Pro" while logged out. Auth modal should open.
2. Click "Get Pro" while logged in. Should redirect to Stripe checkout.
3. Check browser console for errors in both flows.
