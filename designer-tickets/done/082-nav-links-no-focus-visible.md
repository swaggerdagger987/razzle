# DES-082: Nav links and hamburger have no :focus-visible style

**Priority**: P2
**Area**: frontend/styles.css lines 207-248
**Cycle**: 8

## Problem

Navigation links (`.nav-links a`) have `:hover` and `.active` styles but no `:focus-visible`. Keyboard navigation through the top nav produces no visual focus indicator. The hamburger button (`.hamburger-toggle`, lines 235-248) similarly has no `:focus-visible` rule.

The nav appears on every page. Keyboard users tabbing through the site get no visual feedback on which nav link is focused.

## Fix

Add `:focus-visible` rules:

```css
.nav-links a:focus-visible {
  outline: 2px solid var(--orange);
  outline-offset: 2px;
}

.hamburger-toggle:focus-visible {
  outline: 2px solid var(--orange);
  outline-offset: 2px;
}
```

## Design Rule

WCAG 2.1 SC 2.4.7: Focus Visible. The nav is the primary navigation element — it must have visible keyboard focus.
