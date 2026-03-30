# DES-191: Home + pricing CTA buttons use 120-char inline onclick handlers

**Priority**: P2
**Category**: Code Quality / Conversion Path
**Affects**: index.html lines 822, 839 — the two most important buttons on the home page
**Cycle**: 18

## Problem

The "Get Pro" and "Get Elite" CTA buttons on the home page use massive inline `onclick` handlers (~120 characters each). The logic checks localStorage for auth state, falls through to sessionStorage, then dispatches to openAuthModal or startCheckout. This same logic is duplicated between the two buttons.

This is the conversion funnel's critical path. Inline JS handlers are:
- Hard to debug (no line numbers in error traces)
- Fragile (one typo breaks the entire CTA)
- Not testable
- Duplicated (Pro and Elite repeat near-identical logic)

## Evidence

`index.html:822`:
```html
<button id="homeProCta" class="btn-chunky btn-primary" style="font-size:13px; width:100%;"
  onclick="var u=null;try{u=JSON.parse(localStorage.getItem('razzle_user'))}catch(e){}
  if(!u){try{sessionStorage.setItem('razzle_pending_checkout','pro_year')}catch(x){}
  if(typeof openAuthModal==='function')openAuthModal();else window.location='/pricing.html'}
  else if(typeof startCheckout==='function'){startCheckout('pro_year')}
  else{window.location='/pricing.html'}">Get Pro — $79.99/yr</button>
```

`index.html:839` — identical pattern for Elite.

Compare with `pricing.html` which correctly uses `onclick="handleCheckout('pro')"` — a clean function call.

## Fix

Move checkout logic to a shared function in app.js (or index.html's script block):
```javascript
function handleHomeCheckout(plan) {
  var u = null;
  try { u = JSON.parse(localStorage.getItem('razzle_user')); } catch(e) {}
  if (!u) {
    try { sessionStorage.setItem('razzle_pending_checkout', plan); } catch(x) {}
    if (typeof openAuthModal === 'function') openAuthModal();
    else window.location = '/pricing.html';
  } else if (typeof startCheckout === 'function') {
    startCheckout(plan);
  } else {
    window.location = '/pricing.html';
  }
}
```

Then simplify buttons:
```html
<button id="homeProCta" class="btn-chunky btn-primary" onclick="handleHomeCheckout('pro_year')">Get Pro — $79.99/yr</button>
```

## Why it matters

These buttons are the #1 conversion moment on the home page. A JS error in the inline handler means the CTA silently does nothing — user clicks, nothing happens, user bounces. A named function can be tested, logged, and debugged.
