# DES-129: Sign In button uses <a href="#"> with inline onclick

**Priority:** P1 — Conversion Blocker
**Component:** index.html
**Affects:** Login flow on home page

## Problem

The Sign In button in the home page nav is:
```html
<a href="#" class="btn-chunky btn-sm" onclick="if(typeof openAuthModal==='function') openAuthModal(); return false;">Sign In</a>
```

Three issues:
1. **If app.js fails to load** (ad blocker, CDN error, slow network), `openAuthModal` is undefined and clicking does nothing — no feedback, no error
2. **`href="#"`** causes a scroll-to-top jump if JS fails or `return false` doesn't execute
3. **Should be a `<button>`** — semantic HTML. `<a>` is for navigation, `<button>` is for actions

This is on the HOME PAGE nav — the first thing a returning user clicks to sign in.

## Evidence

- `frontend/index.html:624` — Sign In link with `href="#"` and inline onclick

## Fix

Change to:
```html
<button type="button" class="btn-chunky btn-sm" onclick="if(typeof openAuthModal==='function') openAuthModal();">Sign In</button>
```

Or better: use a data attribute and event delegation in app.js:
```html
<button type="button" class="btn-chunky btn-sm" data-action="sign-in">Sign In</button>
```

## Why it matters

If a Reddit visitor clicks Sign In and nothing happens, they leave. Login is a core funnel element — it must work even under adverse conditions (slow JS load, ad blockers).
