---
id: DQ-202
priority: P1
category: conversion / visual hierarchy
status: open
---

# Pricing page Pro and Elite both use btn-primary — no CTA hierarchy

## Problem

Both the Pro and Elite pricing cards use filled orange `btn-primary` buttons. DESIGN.md defines two button styles for exactly this purpose: `btn-primary` (filled, for THE primary action) and `btn-chunky` (outlined, for secondary actions). With both CTAs looking identical, there's no visual nudge toward the recommended tier.

## Evidence

pricing.html line 293:
```html
<button class="btn-primary" onclick="handleCheckout('pro')">Get Pro</button>
```

pricing.html line 316:
```html
<button class="btn-primary btn-elite" onclick="handleCheckout('elite')">Get Elite</button>
```

The `.btn-elite` override changes the background to purple, but both are still filled buttons with no outlined alternative.

## Fix

Decide which tier is the conversion target:
- If **Pro** is the target: Pro gets `btn-primary` (filled orange), Elite gets `btn-chunky` (outlined)
- If **Elite** is the target: Elite keeps `btn-primary`, Pro gets `btn-chunky`

Per NORTH_STAR.md, Pro is the higher-volume tier — recommend making Pro the filled primary CTA.

## Files
- `frontend/pricing.html` lines 293, 316
