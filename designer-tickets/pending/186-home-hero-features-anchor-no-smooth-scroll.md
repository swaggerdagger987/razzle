# DES-186: Home page "See what's inside" anchor has no smooth scroll

**Priority**: P3 — UX polish
**Scope**: styles.css or index.html (1 rule)
**Category**: UX polish

## Problem

The home page hero has a secondary CTA:

```html
<a href="#features" class="btn-hero btn-hero-secondary">See what's inside</a>
```

Clicking this anchor link causes an instant jump to `<div id="features">`. There is zero `scroll-behavior: smooth` in the entire CSS — the only reference is `scroll-behavior: auto !important` in the `prefers-reduced-motion` override (styles.css:1642), which is a no-op since smooth was never set.

The Lab page has smooth scroll via JS (`wrap.scrollTo({ top: 0, behavior: 'smooth' })`) but the home page anchor uses native browser hash navigation with no smooth behavior.

## Fix

Add `scroll-behavior: smooth` to `html`:

```css
html {
  scroll-behavior: smooth;
}
```

This works with the existing `prefers-reduced-motion` override which already sets `scroll-behavior: auto !important` — users who prefer reduced motion get instant scroll, others get smooth.

Note: this pairs well with DES-182 (scroll-padding-top) — smooth scroll TO the right position vs instant jump to the wrong position.

## Why this matters

Low-priority polish. The "See what's inside" button is the secondary CTA — it's the "I'm curious but not ready to jump in" action. An abrupt jump feels unintentional, like the page broke. Smooth scroll gives the user spatial context about where they're going.
