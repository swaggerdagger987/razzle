# DES-143: .footer-link missing :focus-visible sitewide

**Priority:** P2 — Accessibility / Keyboard Navigation
**Component:** styles.css
**Affects:** Footer links on all 75 pages

## Problem

`.footer-link` has `:hover` styling (line 1354) but no `:focus-visible` indicator. Keyboard users tabbing through the page get no visual feedback when focused on footer links.

This is the same gap that DES-082 fixed for `.nav-links a` — that fix added `:focus-visible` to nav links, but the footer links were not addressed.

The footer contains links to all major pages (Lab, Pricing, About, etc.) plus legal/policy links. Keyboard users navigating these get no focus ring.

## Evidence

- `frontend/styles.css:1345-1356` — `.footer-link` has only `color`, `text-decoration`, `display`, `padding`, `font-family`, `font-size`, `transition` and `:hover` color change
- No `.footer-link:focus-visible` rule exists anywhere in the codebase
- Contrast: `.nav-links a:focus-visible` (line 234+) was added by DES-082

## Fix

Add after `.footer-link:hover` in `frontend/styles.css`:

```css
.footer-link:focus-visible {
  outline: 3px solid var(--orange);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

This matches the existing focus-visible pattern used on nav links and buttons.

## Why it matters

Dynasty power users are keyboard-heavy (J/K navigation, H for heat, T for tiers). The footer is the fallback navigation when the main nav doesn't have what they need. Missing focus indicators break the keyboard-first design philosophy.
