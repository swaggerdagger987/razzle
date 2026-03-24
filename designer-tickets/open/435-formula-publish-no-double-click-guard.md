---
id: DQ-435
priority: P1
area: frontend/formula-store.js
section: formula store / UX
type: double-submission bug
status: open
cycle: 56
---

# Publish formula button has no double-click protection — duplicate submissions possible

## What's wrong

`submitPublish()` in formula-store.js (line 350-443) makes an async fetch to `/api/formulas/publish` but never disables the Publish button during the API call. A user who double-clicks or clicks while network is slow can submit duplicate formulas to the store.

Other buttons in the codebase DO have protection:
- Sleeper Connect: `btn.disabled = true` + "connecting..." text (league-intel.html:2125)
- Auth Login/Register: `disabled = true` during submission (app.js:957, 990)
- Run All Agents: `setScenarioButtonsDisabled(true)` (warroom.js:2592)
- Checkout: `_checkoutInProgress` flag (app.js:1155)

The formula Publish button has none of this.

## Where

- `frontend/formula-store.js:350-443` — `submitPublish()` function
- The Publish button is created dynamically in the publish modal

## Fix

At the top of `submitPublish()`:
```js
var btn = document.querySelector('.publish-submit-btn');
if (btn) { btn.disabled = true; btn.textContent = 'publishing...'; }
```

In the `.finally()` block:
```js
if (btn) { btn.disabled = false; btn.textContent = 'Publish'; }
```

## Not a duplicate of

- DES-272: covers checkout button loading state (pricing.html), not formula publish

## Why this matters

The Formula Store is a community feature. Duplicate formulas pollute the store and erode trust. This is a one-line fix with high impact.
