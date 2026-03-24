# DQ-344: Dynamic promo cards (EA/Lifetime) have no dark mode support

**Priority**: P2
**Category**: Dark Mode — Pricing
**File**: frontend/pricing.html, JS section (around lines 741-777)

## Problem

Early Adopter and Lifetime deal promo cards are generated dynamically in JavaScript with massive inline styles. These inline styles hardcode light-mode-safe colors:
- `border: 3px solid var(--orange)` — OK (var works)
- `background: var(--bg-card)` — OK (var works)
- `box-shadow: 4px 4px 0 var(--orange)` — OK (var works)

BUT the generated HTML cannot be targeted by `[data-theme="dark"]` CSS selectors if it uses unique inline structures without class names. And any text colors, hover states, or secondary backgrounds in the generated cards lack dark mode awareness.

Additionally, the promo badge stickers and price text in these cards use inline `color:` and `background:` that may not flip in dark mode.

## Fix

Option A (preferred): Add CSS classes to the generated promo cards (`.promo-card`, `.promo-badge`, `.promo-price`) and define dark mode overrides in the style block.

Option B: Ensure all inline colors in the generated HTML use only CSS vars that automatically flip in dark mode.

The promo cards are a MONETIZATION surface — dark mode users should see them correctly.
