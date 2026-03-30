# DES-137: .btn-primary + .btn-chunky missing :active state sitewide

**Priority:** P1 — Mobile Conversion
**Component:** styles.css
**Affects:** Every CTA button on every page (pricing, home, Lab toolbar, Bureau)

## Problem

`.btn-primary` and `.btn-chunky` have `:hover` (translate + shadow lift) and `:focus-visible` but NO `:active` state. On mobile devices (62% of traffic per GTM report):

- `:hover` doesn't fire on tap
- `:active` fires on press, giving tactile feedback
- Without `:active`, every button tap (Get Pro, Get Elite, Add Filter, Apply, Export) gives zero visual feedback
- Users can't tell if their tap registered

This is the most-used interaction pattern in the entire product — affecting the pricing page CTAs, Lab toolbar buttons, and all filter controls.

## Evidence

- `frontend/styles.css:765-768` — `.btn-chunky:hover` defined (translate + shadow lift)
- `frontend/styles.css:789-792` — `.btn-primary:hover` defined (translate + shadow lift)
- `frontend/styles.css:804-810` — `:focus-visible` defined for both
- NO `.btn-chunky:active` or `.btn-primary:active` anywhere in the file
- Only `:active` rules: `.hamburger-toggle:active` (line 255) and `.mobile-nav-close:active` (line 323) — nav elements only
- DES-135 fixed `.btn-hero:active` on index.html only — the global button classes were not addressed

## Fix

Add to `frontend/styles.css` after the `:hover` rules:

```css
.btn-chunky:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--ink);
}

.btn-primary:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--ink);
}
```

This gives a "press-down" effect — the opposite of the hover lift. The button physically depresses on tap.

## Why it matters

Every mobile user tapping "Get Pro" on the pricing page currently sees zero visual response. 62% of fantasy football traffic is mobile. Every CTA in the product uses one of these two classes.
