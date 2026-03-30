# DES-185: `prefers-reduced-motion` doesn't disable hover-lift transforms

**Priority**: P3 — Accessibility polish
**Scope**: styles.css (add to existing media query)
**Category**: Accessibility

## Problem

The `prefers-reduced-motion` media query (styles.css:1637-1644) correctly disables animation duration and transition duration:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This makes transitions instant — but the hover-lift transforms still apply. Cards, buttons, and chips still shift position on hover via `transform: translate(-1px, -1px)` combined with increased `box-shadow`. The transition is instant (0.01ms), so the element "jumps" instead of smoothly lifting — which can be more disorienting than the animated version for users with vestibular disorders.

Affected hover states:
- `.nav-links a:hover` → `translate(-1px, -1px)`
- `.btn-chunky:hover` → `translate(-1px, -1px)`
- `.btn-primary:hover` → `translate(-1px, -1px)`
- `.chip:hover` → `translate(-1px, -1px)`
- `.plan-card:hover` → `translate(-1px, -1px)`

## Fix

Add transform override to the existing `prefers-reduced-motion` block:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
    transform: none !important; /* Disable position shifts */
  }
}
```

Note: this may need scoping — `transform: none` on ALL elements could break layout transforms (e.g., `.topnav` sticky behavior, sidebar translateX). May need to target only hover states instead:

```css
@media (prefers-reduced-motion: reduce) {
  .btn-chunky:hover, .btn-primary:hover, .chip:hover,
  .nav-links a:hover, .plan-card:hover {
    transform: none !important;
  }
}
```

## Why this matters

Low priority since the hover shift is small (1-2px). But users who set `prefers-reduced-motion` have specifically requested less motion. The current implementation reduces but doesn't eliminate it.
