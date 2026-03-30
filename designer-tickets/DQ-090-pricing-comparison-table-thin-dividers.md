# DQ-090: Pricing comparison table uses thin dividers instead of 2px dashed

**Priority**: P3 — design system / borders
**Category**: Borders / Dark Mode
**Files**: `frontend/pricing.html` (comparison table section)

## Problem

The pricing page feature comparison table at the bottom uses thin row dividers (browser-default `border-bottom` on table rows or `<hr>` elements). DESIGN.md specifies:

> "Dashed dividers: 2px dashed var(--ink-faint) inside cards"

The comparison table is inside a card-like container but its internal row separators don't follow the dashed divider pattern. They appear as thin hairline rules that look especially weak in dark mode (low contrast against dark background).

Additionally, in dark mode (screenshot evidence from pricing-dark.png), the comparison table rows blend together due to insufficient contrast between row dividers and the dark card background. The thin 1px lines nearly disappear.

## Fix

Style comparison table row dividers consistently:

```css
.comparison-table tr + tr td {
  border-top: 2px dashed var(--ink-faint);
}

[data-theme="dark"] .comparison-table tr + tr td {
  border-top: 2px dashed var(--ink-faint);  /* ink-faint flips to #5c4a3d in dark */
}
```

Remove any 1px solid borders on table rows/cells. Replace with 2px dashed matching the card interior pattern used everywhere else on the site.

## Why It Matters

The comparison table is the decision-making tool on the conversion page. If rows blur together in dark mode, users can't clearly see which features are in which tier. Clear 2px dashed dividers match every other internal card boundary on the site and maintain readability in both themes.

## Verification

1. Open pricing.html in light mode — row dividers should be visible 2px dashed lines
2. Toggle dark mode — dividers should remain clearly visible (not hairline or invisible)
3. Compare to card interior dividers on dashboard.html or tiers.html — same pattern
