---
id: DQ-246
priority: P3
category: tech-debt
page: pricing.html
---

# Pricing page uses `!important` in dark mode overrides

## What's wrong
Multiple dark mode selectors in `pricing.html` use `!important` flags instead of properly scoped selectors. This is a fragile pattern — any future theme change or CSS var update requires hunting for `!important` overrides.

Examples found:
- `.free-celebration` background/color overrides
- `.save-badge` color override
- `.plan-badge` dark mode override
- Banner/promo section backgrounds

## Why it matters
`!important` breaks the cascade. When the design system tokens change (e.g., new color for `--bg-card`), these overrides won't respond. Each one is a future dark-mode bug.

## Fix
Replace `!important` with higher-specificity selectors:
```css
/* Instead of: */
[data-theme="dark"] .save-badge { color: var(--bg) !important; }

/* Use: */
html[data-theme="dark"] .pricing-section .save-badge { color: var(--bg); }
```

Audit `pricing.html` for all `!important` instances and replace with scoped selectors.

## Files
- `frontend/pricing.html` — all `<style>` blocks with `!important`
