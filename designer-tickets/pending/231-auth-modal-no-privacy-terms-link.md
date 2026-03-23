# DES-231: Auth modal has no Privacy Policy / Terms link

**Priority:** P1 — trust/compliance
**Page:** All (auth modal via app.js)
**Cycle:** 22

## Problem

The auth modal (app.js:840-860) collects email + password with zero reference to privacy policy or terms of service. No checkbox, no link, no mention.

The about page (about.html:229-238) HAS a Privacy section covering data handling, Sleeper data, API keys, and analytics. But the auth modal — where users actually provide their data — has zero linkage to it.

## Evidence

- `app.js:847-859` — login and register forms have email, password, error div, submit. Nothing else.
- `about.html:229` — Privacy section exists with 6 bullet points covering data practices.
- No `/terms`, `/privacy`, or `/tos` page exists.

## Fix

Add a subtle line below the register form submit button:

```html
<div style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light); text-align:center; margin-top:8px;">
  by creating an account you agree to our <a href="/about.html#privacy" style="color:var(--ink-light); text-decoration:underline;">privacy practices</a>
</div>
```

Also add `id="privacy"` to the Privacy `<h2>` on about.html for the anchor link.

## Why this matters

1. Reddit power users (target audience) verify everything. A sign-up form with no legal links signals amateur hour.
2. Stripe requires merchants to have accessible terms/privacy for billing compliance.
3. This product stores Sleeper data, API keys, and league information — users want assurance before providing credentials.
