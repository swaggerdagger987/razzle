# DES-262: Home page CTAs hardcode yearly interval — no monthly option

**Priority:** P2
**Category:** Conversion Path
**Affects:** index.html (lines 822, 839)
**Cycle:** 25

## Problem

The home page Pro and Elite CTA buttons hardcode `pro_year` and `elite_year` respectively. There is no way for a user on the home page to start a monthly subscription. The pricing page correctly has a monthly/yearly toggle that builds the interval dynamically (`handleCheckout('pro')` reads `_pricingInterval`).

The massive inline onclick at line 822:
```
sessionStorage.setItem('razzle_pending_checkout','pro_year')
```

A user who prefers monthly billing must:
1. See the home page → click "Get Pro" → gets yearly checkout
2. OR navigate to /pricing.html → toggle to monthly → click Get Pro → gets monthly checkout

This is fine as a DEFAULT (yearly is the better deal and recommended), but if a user completes checkout from the home page, they can ONLY get yearly. If they wanted monthly, they'd discover this only at the Stripe checkout page — or worse, not notice until their card is charged $79.99 instead of $9.99.

## Why This Matters

Price sensitivity matters. Some users want to try monthly before committing yearly. The home page is the #1 landing page. If a user's first checkout attempt forces yearly-only, some will bounce rather than navigate to /pricing.html.

## Fix

Either:
- **Option A (simple):** Add a small note below the home CTAs: "or $9.99/mo — see pricing" linking to /pricing.html
- **Option B (complete):** Route home page CTAs through `handleCheckout('pro')` which reads `_pricingInterval`, and add the pricing page toggle to the home pricing section

Option A is the right scope — the home page pricing section is a summary, not the full pricing page.

## Scope

index.html — 1-2 lines of copy below CTA buttons.
