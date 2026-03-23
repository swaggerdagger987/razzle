# DES-232: "See full feature comparison" link doesn't scroll to feature matrix

**Priority:** P2 — conversion UX
**Page:** index.html
**Cycle:** 22

## Problem

index.html:844: `<a href="/pricing.html">See full feature comparison &rarr;</a>`

This link is below the home page pricing cards. A user who wants to compare features clicks it, lands at the TOP of pricing.html, and sees... the same pricing cards they just scrolled past. The actual feature comparison matrix is below the fold (pricing.html:340+).

Users have to scroll past:
1. The yearly/monthly toggle
2. The "free celebration" section
3. The "try Pro free" banner
4. The Pro and Elite cards (which they just saw on the home page)
5. The Stripe trust badge
6. The BYOK explainer chip

...before reaching the matrix they were promised.

## Fix

1. Add `id="comparison"` to the matrix section on pricing.html (line 341): `<div class="matrix-section" id="comparison">`
2. Update the home page link: `<a href="/pricing.html#comparison">`

## Why this matters

"See full feature comparison" is a high-intent link. The user is evaluating whether to pay. Every extra scroll between click and content is friction. The link promises a comparison — deliver it immediately.
