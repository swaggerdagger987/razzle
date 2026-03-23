---
id: DES-271
title: Pricing card plan names are div not h3 — heading hierarchy gap on conversion page
priority: P2
page: index.html, pricing.html
category: accessibility
cycle: 26
---

## Problem

Pricing card plan names ("Free", "Pro", "Elite") use `<div class="pricing-name">` (index.html) and `<div class="plan-name">` (pricing.html) instead of `<h3>` elements. These visually function as subheadings under the section h2 ("The Screener is forever free" / "Want more? Two ways to upgrade").

Screen reader users navigating by headings skip directly from the section h2 to the next section — they can't jump between plan cards. On mobile, heading navigation is the primary way screen reader users scan a page.

DES-233 covers FAQ questions as div-not-heading. This is the same pattern on the pricing CARDS — the conversion decision point.

## Evidence

- index.html:532-534 — `.pricing-name { font-family: var(--font-display); font-size: 20px; }` (styled as heading, semantically a div)
- index.html:792-793 — Free card: `<div class="pricing-name">Free</div>`
- index.html:809-810 — Pro card: `<div class="pricing-name">Pro</div>`
- index.html:828-829 — Elite card: `<div class="pricing-name">Elite</div>`
- pricing.html:104 — `.plan-name { font-family: var(--font-display); font-size: 24px; }` (same pattern)
- pricing.html:276-277 — Pro card: `<div class="plan-name">Pro</div>`
- pricing.html:300 — Elite card: `<div class="plan-name">Elite</div>`

## Fix

Replace `<div class="pricing-name">` with `<h3 class="pricing-name">` on index.html (3 instances).
Replace `<div class="plan-name">` with `<h3 class="plan-name">` on pricing.html (2 instances).
Add `margin: 0` to the CSS rules if needed to prevent default h3 margins.

## Why This Matters

The pricing section is where users decide to pay. Screen reader users (and SEO crawlers) need heading structure to navigate between plans. This is a one-line fix per card with zero visual change.
