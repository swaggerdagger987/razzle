---
id: DQ-093
title: prefers-reduced-motion — only 1 CSS @media rule, 150+ animated elements unprotected
priority: P2
category: accessibility
status: open
cycle: 13
---

## Problem

The site has extensive animations — hover transforms, transition effects, scroll behavior, confetti, pulse keyframes, slide-ups, toast-ins — but only 1 `@media (prefers-reduced-motion: reduce)` rule exists (styles.css:1637). Users with vestibular disorders or motion sensitivity experience every animation with no way to suppress them.

Current coverage:
- `styles.css:1637` — 1 @media rule (unknown scope)
- `app.js:25` — checks preference for 1 scroll behavior
- `league-intel.html:7400` — checks preference for 1 scroll-to-top

Unprotected: All 15 @keyframes animations (pulse-glow, blink, slideUp, toastIn, skeleton-pulse, etc.), all hover transforms (translate + shadow), all `transition:` rules across 23+ files.

## Evidence

Code: `grep -rn "prefers-reduced-motion" frontend/` returns 3 results total. `grep -rn "@keyframes" frontend/` returns 15 distinct animations. `grep -rn "transition:" frontend/` returns 200+ rules.

## Fix

Add a blanket reduced-motion rule to styles.css:
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

This is the standard approach — one rule covers all elements. Individual fine-tuning can come later.

## Files
- `frontend/styles.css` (add blanket rule)
