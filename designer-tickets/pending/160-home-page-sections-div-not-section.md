# DES-160: Home page sections use `<div>` instead of `<section>` — 6+ landmarks missing

**Priority**: P2 (SEO + Accessibility)
**Page**: index.html (Home page)
**Category**: Semantic HTML

## The Problem

All major content sections on the home page use `<div class="lp-section">` instead of `<section>`. Screen readers and search crawlers can't identify page landmarks. The home page has `<nav>`, `<main>`, and `<footer>` correct — but the content WITHIN `<main>` is all divs.

## Evidence

index.html sections that should be `<section>`:
- Features section (`<div id="features" class="lp-section">`)
- Discovery filters section (`<div class="lp-section">`)
- Social proof section (`<div class="lp-section">`)
- Bureau section (`<div class="lp-section">`)
- Situation Room section (`<div class="lp-section">`)
- Pricing section (`<div class="pricing-section">`)

Each has a heading (h2 or h3), making them valid candidates for `<section>` with an `aria-labelledby` pointing to the heading.

## The Fix

Replace `<div class="lp-section">` with `<section class="lp-section">` for each major content block. Add `aria-labelledby` pointing to the section's heading element. Keep all existing classes — this is a tag change, not a layout change.

Example:
```html
<!-- Before -->
<div id="features" class="lp-section">
  <h2>...</h2>

<!-- After -->
<section id="features" class="lp-section" aria-labelledby="features-heading">
  <h2 id="features-heading">...</h2>
```

## Why This Matters

Google uses landmark elements for page structure understanding. Screen reader users navigate by landmarks — without `<section>`, the entire main content is one flat block. The home page is the #1 organic search landing page and the conversion funnel entry point. Proper landmarks improve both SEO ranking and accessibility compliance.
