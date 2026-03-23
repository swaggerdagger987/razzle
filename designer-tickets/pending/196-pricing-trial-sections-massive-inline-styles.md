# DES-196: Pricing page trial/celebration sections use massive inline styles

**Priority**: P2
**Category**: Design System / Maintainability
**Affects**: pricing.html lines 216-270 — trial banner, free celebration, upgrade prompt
**Cycle**: 18

## Problem

The pricing page's dynamic sections (trial banner, free-celebration, upgrade prompt) use 8+ divs with 5-7 inline style properties each. These inline styles:
- Cannot be overridden by media queries (mobile breakpoints)
- Cannot be overridden by dark mode CSS rules
- Duplicate design system values (font-family, font-size, color, border, radius)
- Are invisible to CSS auditing tools

This is separate from DES-176 (FAQ inline styles). These sections are on the CONVERSION PATH — shown to active/trial users deciding whether to pay.

## Evidence

`pricing.html:216-220` (trial banner):
```html
<div id="trialBanner" style="display:none; background:var(--orange-light, #f7e4d8); border:3px solid var(--orange); border-radius:var(--radius); box-shadow:4px 4px 0 var(--ink); padding:16px 24px; margin-bottom:24px; text-align:center;">
```

`pricing.html:245` (free celebration):
```html
<div class="free-celebration" style="background:var(--bg-card); border:3px solid var(--green); border-radius:var(--radius); box-shadow:4px 4px 0 var(--ink); padding:32px; margin-bottom:32px; text-align:center;">
```

`pricing.html:246-247` (inner content):
```html
<div style="font-family:var(--font-display); font-size:22px; color:var(--green); margin-bottom:8px;">
<div style="font-family:var(--font-hand); font-size:18px; color:var(--ink-medium); margin-bottom:16px;">
```

`pricing.html:266-269` (upgrade prompt):
```html
<div style="text-align:center; margin-bottom:20px; font-family:var(--font-hand); font-size:20px; color:var(--orange);">
<div style="font-family:var(--font-display); font-size:20px; text-align:center; margin-bottom:20px;">
```

8 inline-styled elements total in this section alone.

## Fix

Create CSS classes for each component:
```css
.trial-banner { ... }
.free-celebration { ... }
.free-celebration-title { ... }
.free-celebration-subtitle { ... }
.upgrade-prompt { ... }
.upgrade-prompt-title { ... }
```

Then replace inline styles with class references. This also enables:
- Dark mode overrides via `[data-theme="dark"] .trial-banner { ... }`
- Mobile breakpoints via `@media (max-width: 480px) { .trial-banner { ... } }`

## Why it matters

These sections are shown to users in the conversion decision moment. They can't be styled for dark mode, can't adapt to mobile breakpoints, and can't be audited by CSS tools. Every inline style on the conversion page is a maintenance risk that directly affects revenue.
