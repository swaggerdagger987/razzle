# DQ-106: Pricing dark mode feature comparison table is dim

**Priority**: P2
**Category**: Dark Mode / Readability
**Page**: pricing.html
**Evidence**: pricing-dark-desktop.png, pricing-dark-faq.png

## Problem

In dark mode, the pricing page's feature comparison table (below the pricing cards) and FAQ section use `var(--ink-medium)` for text. In dark mode, `--ink-medium` resolves to `#c4b5a5` (sandy tan) on `--bg-card: #4a3728` (mocha).

While technically above minimum contrast (WCAG AA), the overall visual effect is a dim, washed-out table where feature labels and FAQ answers fade into the background. The comparison table — which is a key decision-making tool for conversion — looks like it's behind a fog layer.

The pricing CARDS (Pro and Elite) above are fine. It's the comparison matrix and FAQ below that suffer.

## Fix

In pricing.html's `[data-theme="dark"]` CSS block:

1. Bump `.feature-matrix td:first-child` color from `var(--ink-medium)` to `var(--ink)` — feature labels should be primary text, not secondary
2. Bump FAQ answer text from `var(--ink-medium)` to `var(--ink)` — answers are primary content
3. Keep `.feature-matrix td` (checkmark/X columns) at `var(--ink-medium)` — these are secondary

This is a 2-3 line CSS change with direct conversion impact.

## Verification

Toggle dark mode on pricing.html. Scroll to the feature comparison table. All feature names in the first column should be clearly readable. FAQ answers should be primary text weight, not dim.
