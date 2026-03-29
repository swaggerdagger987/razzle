---
id: S0-006
severity: S0
category: ux
title: No sign-up CTA above the fold on mobile — conversion funnel gap
source: deep-audit
status: open
---

## Problem

On mobile (390px), the only path to sign up is buried inside the hamburger menu. The hero section has two CTAs — "Open the Screener" and "See what's inside" — but neither leads to authentication. A first-time mobile visitor who wants to create an account has to discover the hamburger menu first.

Fantasy football traffic skews heavily mobile (game day usage). Hiding the primary conversion action behind a hamburger is a critical funnel gap.

## Root Cause (UPDATED 2026-03-29 — code investigation)

**Hero CTAs** — `frontend/index.html:661-665`:
```html
<div class="hero-cta">
  <a href="/lab.html" class="btn-hero btn-hero-primary">Open the Screener</a>
  <a href="#features" class="btn-hero btn-hero-secondary desktop-only-cta">See what's inside</a>
  <button class="mobile-signup-cta" onclick="if(typeof openAuthModal==='function')openAuthModal('register');">Sign Up Free</button>
</div>
```
A mobile signup button **DOES exist** in the HTML with class `mobile-signup-cta`.

**CSS visibility toggle** — `frontend/index.html:145-149` (inline styles):
```css
.mobile-signup-cta { display: none; }
@media (max-width: 768px) {
  .mobile-signup-cta { display: inline-block; }
  .desktop-only-cta { display: none; }
}
```
The button is shown at 768px and below, hidden on desktop.

**Remaining concerns**:
1. The `onclick` guard `typeof openAuthModal==='function'` may fail if `app.js` hasn't loaded yet — the button silently does nothing
2. The hero padding (`72px 24px 48px` at line 70) may push the CTA below the fold on shorter mobile screens (e.g., iPhone SE 667px viewport height)
3. The button uses plain `<button>` without `btn-hero` class — may not match hero CTA styling

**Desktop nav auth** — `frontend/index.html:644-646`: Sign In button in `.nav-auth`.

**Mobile hamburger auth** — `frontend/app.js:210-221`: Sign In injected into mobile nav footer panel.

**CSS breakpoint** — `frontend/styles.css:420-430`: `.nav-links { display: none !important; }` at 768px.

## Fix

Add a visible "Sign Up Free" or "Get Started" CTA button to the hero section on mobile. This should:
1. Call `openAuthModal()` with the Register tab pre-selected
2. Use `btn-hero btn-hero-secondary` styling (or a new accent style)
3. Sit alongside or replace "See what's inside" on mobile

## Accept When

- On a 390px viewport, a sign-up button is visible above the fold without opening the hamburger
- Tapping it opens the auth modal on the Register tab
- Desktop layout is not affected (the existing nav Sign In button remains)
