# DES-265: Pricing FAQ is always-expanded — 9 items create excessive scroll on mobile

**Priority:** P2
**Category:** Mobile UX / Conversion
**Affects:** pricing.html (lines 398-443)
**Cycle:** 25

## Problem

The pricing page has 9 FAQ items that are always fully expanded. On a 375px mobile viewport, this creates ~1200px of FAQ content that users must scroll through to reach the footer or back to the CTA. There is no collapse/expand behavior — every question and answer is always visible.

Compare to standard pricing page patterns: Stripe, Linear, and every SaaS pricing page uses collapsible accordions for FAQ sections. Users scan question text, tap to expand answers they care about.

## Why This Matters

The pricing page is the conversion page. Mobile users (62%+ of traffic from Twitter/Reddit) who scroll past the plan cards into the FAQ may never scroll back up to the CTA. Collapsible FAQs keep the page compact and let users find their specific question faster.

Also: collapsible FAQ items naturally pair with `<details>/<summary>` elements, which are accessible, keyboard-navigable, and semantically correct — fixing DES-233 (FAQ questions are div not heading) at the same time.

## Fix

Replace the current FAQ `div` structure with native `<details>/<summary>`:

```html
<details>
  <summary>What's the difference between Pro and Elite?</summary>
  <p>Same features. The only difference is who provides the AI...</p>
</details>
```

Style with chunky borders and Caveat annotation feel. `<summary>` acts as a heading-like element, solving the accessibility issue.

## Scope

pricing.html — replace 9 FAQ item divs with `<details>/<summary>`. Add CSS for the accordion styling. Consider opening the first 2 by default (most common questions).
