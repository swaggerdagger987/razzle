# DES-182: Zero scroll-margin-top — sticky nav covers anchor scroll targets

**Priority**: P2 — UX (affects home page CTA)
**Scope**: styles.css (1 rule), affects all pages with anchor links
**Category**: UX polish

## Problem

The `.topnav` is `position: sticky; top: 0` with ~50-56px total height (10px padding * 2 + content + 3px border). When users click anchor links (like "See what's inside" on the home page which links to `#features`), the browser scrolls the target element to the top of the viewport — directly behind the sticky nav.

Zero `scroll-margin-top` or `scroll-padding-top` exists in the entire CSS.

Affected anchor navigation:
- **Home page**: `<a href="#features">See what's inside</a>` → target `<div id="features">` scrolls behind nav
- **Home page**: `<a href="#main-content" class="skip-link">Skip to main content</a>` → `<main id="main-content">` scrolls behind nav
- **Lab**: any `scrollIntoView()` calls where the target is near the top of the viewport
- **URL hash navigation**: direct links like `razzle.lol/#features` land with content hidden

## Fix

Add one CSS rule to styles.css:

```css
html {
  scroll-padding-top: 64px; /* nav height (~56px) + 8px breathing room */
}
```

This applies to all anchor navigation, hash links, and `scrollIntoView({ block: "start" })` calls globally.

## Why this matters

The "See what's inside" button is the secondary CTA on the home page hero — the first interaction a curious visitor takes after deciding not to jump directly to the Screener. If that click lands them behind the nav with the features section heading hidden, the experience feels broken.
