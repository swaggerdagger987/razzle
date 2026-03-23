# DES-081: Theme toggle button has no :focus-visible style

**Priority**: P1
**Area**: frontend/styles.css lines 983-999
**Cycle**: 8

## Problem

The `.theme-toggle` button has a `:hover` rule (line 996) but zero `:focus` or `:focus-visible` rules. This button is injected via JS on every page and is one of the first interactive elements in the nav.

A keyboard user pressing Tab lands on the theme toggle with no visible focus ring. Chromium strips native outlines when `border` and `box-shadow` are custom-styled, so the default browser focus indicator is unreliable here.

This affects every page on the site.

## Fix

Add a `:focus-visible` rule after the existing `:hover` rule:

```css
.theme-toggle:focus-visible {
  outline: 2px solid var(--orange);
  outline-offset: 2px;
}
```

This matches the existing `.btn-chunky:focus-visible` pattern (lines 760-766 of styles.css).

## Design Rule

WCAG 2.1 SC 2.4.7: Focus Visible — interactive elements must have a visible focus indicator for keyboard users. Dynasty power users (the primary audience) are keyboard-heavy.
