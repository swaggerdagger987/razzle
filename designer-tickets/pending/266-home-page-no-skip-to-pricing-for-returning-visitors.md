# DES-266: Home page has no fast path for returning visitors to reach pricing

**Priority:** P2
**Category:** Conversion Path / UX
**Affects:** index.html
**Cycle:** 25

## Problem

A returning visitor who already knows what Razzle is and wants to upgrade must scroll past 6 full sections on the home page before reaching the pricing cards:

1. Hero (viewport height)
2. Live mini-screener
3. Feature showcase (4 cards)
4. Discovery filters (chips)
5. Social proof section (3 cards)
6. Bureau section (CTA)
7. Situation Room section (demo cards)
8. **Finally: Pricing section**

That's ~4-5 full viewport scrolls on mobile. The nav has a "Pricing" link to `/pricing.html`, but no anchor link to the on-page pricing section. The "See what's inside" hero CTA goes to `#features` (section 3) — there's no equivalent quick link to the pricing section.

Meanwhile, the pricing section `<div class="pricing-section">` has no `id` attribute, so even if someone wanted to link to it, they can't.

## Why This Matters

The conversion funnel: Twitter screenshot → home page → scroll → find pricing → decide. Returning visitors who saw Razzle yesterday and came back today to sign up have to re-scroll the entire pitch. Every scroll is a chance to bounce. A `#pricing` anchor on the page + a link in the hero CTA area gives returning visitors a fast path to convert.

## Fix

1. Add `id="pricing"` to the pricing section div:
```html
<div id="pricing" class="pricing-section">
```

2. Add a subtle anchor link in the hero or below the mini-screener:
```html
<a href="#pricing" style="font-family:var(--font-mono); font-size:12px; color:var(--ink-light);">already know the deal? skip to pricing</a>
```

## Scope

index.html — 1 `id` attribute, 1 optional anchor link.
