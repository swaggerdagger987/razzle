# DES-284: startCheckout finally block flashes button text during Stripe redirect

**Priority**: P2
**Page**: app.js (all pages with checkout CTAs)
**Affects**: Users clicking checkout buttons on slow networks

## Problem

`startCheckout()` in app.js (line 1154-1208) shows "processing..." on the button during checkout, then has a `finally` block that restores the original button text. But in JavaScript, `finally` executes even after `return` inside `try`.

When checkout succeeds and `window.location.href = data.checkout_url` is set (line 1194), the code returns at line 1195. But the `finally` block at line 1201-1207 STILL runs, restoring the button to its original text ("Get Pro") before the browser completes the redirect.

**User sees on slow networks:**
1. Click "Get Pro"
2. Button changes to "processing..."
3. API succeeds, redirect URL received
4. Button flashes back to "Get Pro" (finally block)
5. Page navigates to Stripe

The step 4 flash is confusing — "did it work or not?"

## Evidence

```js
// app.js:1192-1208
try {
  ...
  if (data.checkout_url) {
    window.location.href = data.checkout_url;
    return; // Comment says "Don't reset — navigating away"
    // BUT: finally still runs after return!
  }
} finally {
  _checkoutInProgress = false;
  if (btn && origText) {
    btn.textContent = origText;  // This runs even after the return
    btn.disabled = false;
    btn.style.opacity = "";
  }
}
```

## Fix

Guard the `finally` block with a flag:

```js
var _redirecting = false;

// In the success path:
if (data.checkout_url) {
  _redirecting = true;
  window.location.href = data.checkout_url;
  return;
}

// In the finally block:
finally {
  _checkoutInProgress = false;
  if (!_redirecting && btn && origText) {
    btn.textContent = origText;
    btn.disabled = false;
    btn.style.opacity = "";
  }
}
```

## Why This Matters

The checkout button is the highest-stakes interactive element. A flash of "Get Pro" after "processing..." creates a micro-moment of doubt. On fast networks it's invisible; on mobile (62% of traffic), the redirect may take 1-3 seconds, making the flash noticeable.
