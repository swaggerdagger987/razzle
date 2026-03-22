---
id: DES-016
priority: P2
area: sitewide (CSS architecture)
status: open
created: 2026-03-22
---

# DES-016: --radius CSS variable (12px) defined but barely used — 7+ different border-radius values hardcoded

## What's Wrong

`:root` defines `--radius: 12px` as a design token, but it's used in only ~2 places (`.cmd-palette` and one other). Meanwhile, the home page alone has 7+ different hardcoded border-radius values:

- `3px` — redacted text, mini-pos badges
- `4px` — pricing badge (pricing page), promo input
- `8px` — plan-card (pricing page), auth tabs, promo input
- `10px` — social-card, trial banners
- `12px` — feature-card, pricing-card (home), about sections
- `16px` — screener-visual-card, auth modal
- `20px` — smart-chip, agent-badge, pricing-badge

The `--radius` variable was clearly intended to centralize this, but adoption didn't follow through. The result is ungoverned border-radius that makes global design changes impossible.

## Why It Matters

If the design team decides to shift from 12px to 8px radius (or vice versa), there's no single lever to pull — every page has hardcoded values. This also creates subtle visual inconsistency between cards, badges, and inputs that feel like they should match.

## Fix

Introduce 3 radius tokens covering the actual usage patterns:

```css
:root {
  --radius-sm: 8px;   /* inputs, tabs, small cards */
  --radius: 12px;     /* cards, modals */
  --radius-pill: 20px; /* chips, badges, pills */
}
```

Then replace hardcoded values across all files to use these tokens. Start with the home page and pricing page (highest conversion impact), then expand sitewide.

## Files

- `frontend/styles.css` — `:root` (add tokens)
- `frontend/index.html` — all inline/embedded border-radius values
- `frontend/pricing.html` — all inline/embedded border-radius values
- All panel HTML files (lower priority — do after main pages)
