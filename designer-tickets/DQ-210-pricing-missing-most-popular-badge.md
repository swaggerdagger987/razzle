---
id: DQ-210
priority: P1
category: conversion / visual hierarchy
status: open
---

# Pricing page missing "Most Popular" badge on recommended tier

## Problem

Standard SaaS pricing pages use a "Most Popular" or "Recommended" badge to guide users toward the conversion target. Razzle's pricing page has three cards (Free, Pro, Elite) with plan badges ("forever free", "the film room upgrade", "full war machine") but NONE of them signals which is recommended.

The badges describe what each tier IS, but don't tell the user which one to CHOOSE. This is a missed conversion signal — users who are ready to pay scan for "most popular" to validate their choice.

This is distinct from DES-330 (Free card visually subordinate on HOME page) and DES-286 (agents.html recommended badge dark mode). This is specifically about pricing.html needing a conversion-guiding "Most Popular" badge.

## Evidence

pricing.html line 275:
```html
<div class="plan-badge">the film room upgrade</div>  <!-- Pro -->
```

pricing.html line 299:
```html
<div class="plan-badge">full war machine</div>  <!-- Elite -->
```

No "Most Popular", "Recommended", or similar conversion-guiding badge anywhere on the page.

## Fix

Add a secondary badge to the Pro card (or whichever is the conversion target):

```html
<div class="plan-badge popular-badge" style="transform:rotate(-2deg);">most popular</div>
```

Style with distinct visual weight — gold/yellow background, sticker rotation, slightly larger than the descriptive badges:

```css
.popular-badge {
  background: var(--yellow);
  color: var(--ink);
  border: 2px solid var(--ink);
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  transform: rotate(-2deg);
  box-shadow: 2px 2px 0 var(--ink);
  font-family: var(--font-display);
  font-size: 12px;
  text-transform: uppercase;
}
```

## Files
- `frontend/pricing.html` — add badge to Pro card section
