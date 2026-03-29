---
id: S2-090
severity: S2
confidence: HIGH
category: conversion-ux
source: DQ-284
status: OPEN
---

# startCheckout finally block restores button state before Stripe redirect completes

## Root Cause

`frontend/app.js:1272-1279`:

```javascript
finally {
  _checkoutInProgress = false;
  if (btn && origText) {
    btn.textContent = origText;
    btn.disabled = false;
    btn.style.opacity = "";
  }
}
```

When `window.location.href = data.checkout_url` is set at line 1265, the `finally` block still executes immediately because `window.location.href` assignment returns synchronously while the navigation happens asynchronously. This flashes the button back to "Get Pro"/"Get Elite" for a split second before the user navigates away.

The loading state at lines 1241-1243 (`btn.textContent = "processing..."; btn.disabled = true; btn.style.opacity = "0.6"`) is correct — but the finally block undoes it prematurely.

## Fix

Don't restore button state in the finally block when redirect is successful. Only restore on error:

```javascript
} catch (e) {
  if (btn && origText) {
    btn.textContent = origText;
    btn.disabled = false;
    btn.style.opacity = "";
  }
  _checkoutInProgress = false;
}
// Remove the finally block entirely — if redirect succeeds, page unloads
```

## Files

- `frontend/app.js:1272-1279` — finally block

## Acceptance Criteria

- Clicking checkout shows "processing..." and stays disabled until page navigates away
- On error, button restores to original state
- No visual flash during successful checkout redirect
