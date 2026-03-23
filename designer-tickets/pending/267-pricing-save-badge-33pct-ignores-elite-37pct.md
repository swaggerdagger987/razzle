---
id: DES-267
title: Pricing save-badge reads "save 33%" — doesn't reflect Elite's 37% savings
priority: P1
page: pricing.html
category: conversion-copy
cycle: 26
---

## Problem

The save-badge next to the yearly/monthly toggle always reads "save 33%" (pricing.html:241). Pro saves 33%, Elite saves 37.5%. The badge is the first visual signal of yearly value — it understates Elite savings by 4 percentage points.

The `updatePricingUI()` function at line 570-572 correctly updates each plan card's interval text with the right percentage (`PRICES.pro.save = '33%'`, `PRICES.elite.save = '37%'`), but the toggle-level `#saveBadge` text is never updated from its HTML default.

Additionally, when monthly is selected (line 575), the badge is hidden with `opacity: 0` but NOT `display: none` — screen readers still announce "save 33%" even when monthly pricing is shown.

## Evidence

- pricing.html:241 — `<span class="save-badge" id="saveBadge">save 33%</span>` (hardcoded)
- pricing.html:540-543 — `PRICES` object has `pro.save: '33%'` and `elite.save: '37%'`
- pricing.html:565 — yearly: `badge.style.opacity = '1'` (shows badge, but never updates text)
- pricing.html:575 — monthly: `badge.style.opacity = '0'` (hides visually, still in a11y tree)

## Fix

1. Change badge text to "save up to 37%" in HTML
2. OR make it dynamic: when yearly is selected, show "save 33-37%"
3. When monthly is selected, add `aria-hidden="true"` alongside `opacity: 0`

## Why This Matters

The pricing page is the #1 conversion surface. The save-badge is designed to nudge users toward yearly billing. Understating savings on the highest-value plan (Elite) reduces the yearly nudge for the customers most likely to convert.
