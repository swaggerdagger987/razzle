# DES-228: Auth register form has no trial incentive copy

**Priority:** P1 — conversion lift
**Page:** All (auth modal via app.js)
**Cycle:** 22

## Problem

The Register tab (app.js:853-859) shows: email + password + confirm password + "Create Account" button. Zero mention of the 7-day Pro trial.

The trial info only appears AFTER registration, in the Sleeper link prompt (app.js:1284). But the decision to register happens BEFORE that. At the exact moment a user is deciding whether to create an account, the key incentive is invisible.

Every other touchpoint prominently features the trial:
- Home page: "7-day free trial" (line 820)
- Home page: "7-day Pro trial on sign-up. No credit card required." (line 843)
- Pricing page: "7-day free trial" on both Pro and Elite cards (lines 289, 312)
- Lab upgrade gate: "7-day Pro trial on sign-up. Cancel anytime." (line 4403)

## Fix

Add a single line below the "Create Account" button in the register form:

```html
<div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light); text-align:center; margin-top:4px;">
  includes 7-day Pro trial. no credit card.
</div>
```

## Why this matters

Registration is the narrowest point in the conversion funnel. A user has already clicked "Sign In", switched to "Register", and is staring at empty fields. This is maximum intent + maximum friction. A single line of reassurance could meaningfully lift registration rate.
