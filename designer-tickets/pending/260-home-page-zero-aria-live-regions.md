# DES-260: Home page has zero aria-live regions for dynamic content

**Priority:** P2
**Category:** Accessibility
**Affects:** index.html
**Cycle:** 25

## Problem

The home page has two sections that update dynamically after page load:

1. **Mini-screener** (line 966-992) — `_renderMiniRows()` replaces tbody innerHTML with live player data fetched from API
2. **CTA buttons** (line 920-948) — `_updateHomeCTAs()` changes button text based on auth state ("Get Pro" → "Enter the Situation Room")

Neither container has `aria-live` or `role="status"`. Screen readers don't announce when live data loads or when CTAs update. The mini-screener is the first interactive content a visitor encounters — it's meant to impress. Screen reader users hear nothing when data loads.

## Why This Matters

5-10% of the target audience (tech-comfortable 22-40 year olds) use assistive tech or keyboard-heavy workflows. The mini-screener is designed to create a "wow" moment — that moment is silent for screen reader users.

## Fix

1. Add `aria-live="polite"` to the mini-screener tbody:
```html
<tbody id="miniScreenerRows" aria-live="polite">
```

2. Add a visually hidden status div for CTA changes:
```html
<div id="ctaStatus" class="sr-only" aria-live="polite"></div>
```
Update it in `_updateHomeCTAs()` when trial/paid state changes CTA text.

## Scope

index.html — 2 attribute additions, 1 small div.
