---
id: DES-341
priority: P3
area: sitewide (nav bar)
section: dark mode toggle
type: visual / discoverability
status: open
---

# Dark mode toggle is a tiny icon buried at the far-right edge of the nav bar

## What's wrong

The dark mode toggle is a small ~24px half-moon circle icon positioned at the extreme right edge of the nav bar, past the "Sign In" button. It's easy to miss entirely. Many users may never discover that the site has a full dark mode implementation.

The site invested heavily in dark mode (Espresso Flip palette, CSS variable system, per-component overrides across 75+ pages), but the toggle that activates it has less visual prominence than the search button.

## Where

Nav bar, far right. Visible in all pages via the shared nav component.

## Evidence

Screenshot: home-nav-close.png — the toggle is the last element, a small circle icon after "Sign In". It's smaller than any other nav element and has no label.

## Suggested fix

1. Add a text label next to the icon: the icon + "Dark" text (or just a slightly larger icon)
2. Move it to a more discoverable position — perhaps inside a settings dropdown or next to the logo
3. Give it the same border treatment as the "Sign In" button (2px ink border, pill shape)
4. On first visit, briefly pulse or highlight the toggle to signal its existence

## Why this matters

Dark mode is a feature users actively seek for late-night fantasy research sessions. If they can't find the toggle, they assume it doesn't exist. The design system invested 100+ hours in dark mode — the toggle should match that investment.
