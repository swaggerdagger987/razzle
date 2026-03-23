---
id: DES-276
title: Pricing free-celebration section has 8 inline style attributes — unmaintainable
priority: P2
page: pricing.html
category: css-governance
cycle: 26
---

## Problem

The "What everyone gets. Forever." free-celebration section on pricing.html (lines 245-263) uses 8 inline `style` attributes across 5 elements. The section container alone has:

```html
<div class="free-celebration" style="background:var(--bg-card); border:3px solid var(--green); border-radius:12px; box-shadow:4px 4px 0 var(--green); padding:32px 28px; margin-bottom:32px; text-align:center;">
```

This duplicates what could be 1 CSS rule. The inner elements (heading, subheading, chip grid) also use inline styles.

The `.free-celebration` class IS defined in dark mode CSS (line 171: `[data-theme="dark"] .free-celebration { background: var(--bg-card) !important; }`) — but the dark mode rule needs `!important` specifically BECAUSE the inline style has higher specificity. This is the inline-style → !important cascade escalation pattern.

DES-196 covers trial banner inline styles on this same page. This is the parallel issue for the free-celebration section.

## Evidence

- pricing.html:245 — container: 8 CSS properties inline
- pricing.html:246 — heading: `style="font-family:var(--font-display); font-size:22px; margin-bottom:4px;"`
- pricing.html:247 — subheading: `style="font-family:var(--font-hand); font-size:18px; color:var(--ink-light); margin-bottom:20px;"`
- pricing.html:248 — chip grid: `style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; max-width:600px; margin:0 auto;"`
- pricing.html:171 — dark mode needs `!important` to override inline style

## Fix

Move all inline styles to the page `<style>` block under `.free-celebration` and child selectors:
```css
.free-celebration { background: var(--bg-card); border: 3px solid var(--green); border-radius: 12px; box-shadow: 4px 4px 0 var(--green); padding: 32px 28px; margin-bottom: 32px; text-align: center; }
.free-celebration h2 { font-family: var(--font-display); font-size: 22px; margin-bottom: 4px; }
.free-celebration .sub { font-family: var(--font-hand); font-size: 18px; color: var(--ink-light); margin-bottom: 20px; }
.free-celebration .chips { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 600px; margin: 0 auto; }
```

Then remove `!important` from the dark mode override.

## Why This Matters

Inline styles on the conversion page prevent responsive overrides, require `!important` escalation for dark mode, and make the pricing layout brittle for future changes. Every inline style is maintenance debt on the page that needs to convert visitors to paying users.
