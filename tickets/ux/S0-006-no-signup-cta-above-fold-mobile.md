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

## Root Cause

**Hero CTAs** — `frontend/index.html:656-659`:
```html
<div class="hero-cta">
  <a href="/lab.html" class="btn-hero btn-hero-primary">Open the Screener</a>
  <a href="#features" class="btn-hero btn-hero-secondary">See what's inside</a>
</div>
```
No auth CTA exists in the hero.

**Desktop nav auth** — `frontend/index.html:644-646`:
```html
<div class="nav-auth" id="nav-auth">
  <button class="btn-chunky btn-sm" onclick="...openAuthModal();">Sign In</button>
</div>
```
This div is NOT explicitly hidden at mobile breakpoints in CSS, but may be visually obscured by layout at 390px.

**Mobile hamburger auth** — `frontend/app.js:204-215`:
The Sign In button is injected into the mobile nav panel (line 209), accessible only after tapping the hamburger icon.

**CSS breakpoint** — `frontend/styles.css:416-417`:
```css
.nav-links { display: none !important; }
```
Nav links hidden at 768px, but `.nav-auth` is not explicitly hidden.

## Fix

Add a visible "Sign Up Free" or "Get Started" CTA button to the hero section on mobile. This should:
1. Call `openAuthModal()` with the Register tab pre-selected
2. Use `btn-hero btn-hero-secondary` styling (or a new accent style)
3. Sit alongside or replace "See what's inside" on mobile

## Accept When

- On a 390px viewport, a sign-up button is visible above the fold without opening the hamburger
- Tapping it opens the auth modal on the Register tab
- Desktop layout is not affected (the existing nav Sign In button remains)
