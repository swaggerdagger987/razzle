# DQ-038: Situation Room Pro teaser uses custom button class

**Priority**: P3 — design system consistency
**Page**: agents.html, warroom.js
**Category**: Component consistency

## Problem

The Pro teaser card in the Situation Room uses a custom `.btn-pro-upgrade` class (agents.html lines 711-729) that duplicates the exact same styling as the design system's `.btn-primary`:
- Orange background, ink border, 3px chunky border, 4px shadow, hover lift

This creates a parallel button implementation outside the design system, which will drift over time.

## Evidence

- agents.html lines 711-729: custom `.btn-pro-upgrade` CSS
- warroom.js line 3324: `<a class="btn-pro-upgrade" href="/pricing.html">`
- styles.css `.btn-primary` has identical visual treatment

## Fix

1. Remove `.btn-pro-upgrade` CSS from agents.html (lines 711-729)
2. In warroom.js line 3324, replace `class="btn-pro-upgrade"` with `class="btn-primary"`
3. Keep the `aria-label` and `onclick` handler as-is
