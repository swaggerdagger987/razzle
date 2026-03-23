# DES-236: Nav dropdown header email at 10px — below type scale minimum

**Priority:** P2 — design system governance
**Page:** All (logged-in nav via styles.css)
**Cycle:** 22

## Problem

styles.css:586: `.nav-dropdown-header` has `font-size: 10px`. Below the DESIGN.md type scale minimum of 11px.

This element displays the user's email address in the logged-in nav dropdown. It's the identity confirmation — "you're signed in as user@example.com." At 10px, it's difficult to read, especially on mobile.

Additionally, styles.css:557: `.nav-user-caret` has `font-size: 10px`. Same sub-minimum violation.

## Evidence

- styles.css:586: `.nav-dropdown-header { font-size: 10px; }`
- styles.css:557: `.nav-user-caret { font-size: 10px; }`
- DESIGN.md type scale minimum: 11px (for uppercase section labels)
- DES-211 covers sitewide 10px instances but focuses on lab-panels.css (125 instances). These nav items are separate.

## Fix

```css
.nav-dropdown-header { font-size: 11px; }
.nav-user-caret { font-size: 11px; }
```

The caret (▾) will still be visually small at 11px. The email header gains readability.

## Why this matters

The nav dropdown is how paid users access subscription management, sign out, and see their plan status. The email header is their identity anchor. 10px makes it feel like an afterthought in their own product.
