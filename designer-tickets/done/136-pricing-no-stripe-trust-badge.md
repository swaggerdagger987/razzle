# DES-136: Pricing page missing payment trust signal

**Priority:** P3 — Trust / Conversion Polish
**Component:** pricing.html
**Affects:** Checkout conversion rate

## Problem

The pricing page has CTA buttons ("Get Pro", "Get Elite") that trigger Stripe checkout, but there's no visual trust signal near the payment CTAs indicating secure payment processing. No Stripe logo, no "Secured by Stripe" text, no lock icon.

Standard SaaS pricing pages include payment trust signals to reduce checkout anxiety. Dynasty fantasy managers are spending $80-150/yr — they want to know their payment is secure, especially from a brand-new site they just discovered on Reddit.

## Evidence

- `pricing.html` — No Stripe logo, badge, or "secured by" text anywhere on the page
- CTA buttons jump directly to Stripe checkout with no intermediary trust signal
- Competitors: Dynasty Nerds shows "Secure checkout" badge, FantasyPros shows Stripe badge

## Fix

Add a small trust signal below or near the upgrade CTAs:
```html
<div style="text-align:center; margin-top:16px; font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">
  <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px;"><!-- lock icon --></svg>
  Secured by Stripe. Cancel anytime.
</div>
```

Or use Stripe's official badge if their brand guidelines allow it.

## Why it matters

First-time visitors from Reddit have zero trust in razzle.lol. They've never heard of it. A Stripe badge is a borrowed trust signal that says "your payment goes through the same processor as Shopify, Notion, and Figma." Small signal, meaningful conversion lift.
