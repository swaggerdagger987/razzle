# DES-188: Pricing upgrade grid inline style defeats mobile CSS breakpoint

**Priority**: P1
**Category**: Mobile / Conversion Path
**Affects**: pricing.html — the conversion page, line 271
**Cycle**: 18

## Problem

The upgrade section `.plans-grid` at line 271 has an inline `style="grid-template-columns:1fr 1fr;"` that overrides the CSS media query at line 57. Inline styles have higher specificity than any CSS rule (even `!important` in some cases).

At mobile widths (< 480px), the CSS wants to collapse to 1-column, but the inline style forces 2 columns. Two pricing cards side by side on a 375px screen means each card is ~170px wide — too narrow for readable pricing copy.

## Evidence

`pricing.html:271`:
```html
<div class="plans-grid" style="grid-template-columns:1fr 1fr;">
```

`pricing.html:56-58` (CSS):
```css
.plans-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
@media (max-width: 900px) { .plans-grid { grid-template-columns: 1fr 1fr !important; } }
```

No `@media (max-width: 480px)` breakpoint exists for `.plans-grid`. Even if one were added, the inline style would win.

## Fix

Remove the inline style from line 271:
```html
<div class="plans-grid">
```

Add a CSS rule for the upgrade context (the 2-card grid vs the 3-card grid):
```css
.plans-grid--upgrade { grid-template-columns: 1fr 1fr; }
@media (max-width: 600px) { .plans-grid--upgrade { grid-template-columns: 1fr; } }
```

## Why it matters

This is the CONVERSION PAGE. 62% of Twitter/Reddit traffic is mobile. If pricing cards are crushed at 375px, users can't read the feature lists and bounce. This directly blocks the 1,000-user goal.
