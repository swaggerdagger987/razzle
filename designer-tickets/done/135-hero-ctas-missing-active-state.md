# DES-135: Home page hero CTAs missing :active state

**Priority:** P3 — Polish / Mobile UX
**Component:** index.html
**Affects:** Mobile users on home page

## Problem

The `.btn-hero` class has `:hover` styling (translate + shadow lift) but no `:active` state. On mobile devices:
- `:hover` doesn't fire on tap (it fires on hover, which touch screens don't have)
- `:active` fires on press, giving tactile feedback
- Without `:active`, mobile users tap "Open the Screener" and see zero visual change for the duration of the network request

This creates "did it work?" anxiety. Users may tap multiple times.

## Evidence

- `frontend/index.html:119-122` — `.btn-hero:hover` defined with translate/shadow
- No `.btn-hero:active` rule exists
- Mobile traffic is the primary source (Twitter/Reddit links open on phones)

## Fix

Add to index.html `<style>`:
```css
.btn-hero:active {
  transform: translate(0, 0);
  box-shadow: 2px 2px 0 var(--ink);
}
```

This gives a "press-down" effect — the opposite of the hover lift. The button physically depresses on tap.

## Why it matters

62% of fantasy football usage is mobile (GTM report). Twitter and Reddit traffic from launch is overwhelmingly mobile. The hero CTA tap must feel responsive. It's a 3-line fix with disproportionate UX impact.
