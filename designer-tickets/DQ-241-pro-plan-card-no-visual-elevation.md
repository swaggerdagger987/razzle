---
id: DQ-241
priority: P1
category: conversion
page: pricing.html
---

# Pro plan card visually indistinguishable from Free tier

## What's wrong
The Pro plan card — Razzle's primary revenue product — has **no visual prominence** over the Free card. There is no `.plan-card.pro` CSS class. The Free card gets green border/shadow, the Elite card gets purple, but the Pro card gets... default ink. Same size, same shadow, same everything.

The badge says "the film room upgrade" but that's branding text, not a conversion signal like "Most Popular" or "Recommended."

## Why it matters
Every SaaS pricing page elevates the mid-tier plan. The Pro card is where 80%+ of revenue should come from. Right now a visitor's eye has no reason to land on it first. The Elite card (purple) actually draws MORE attention.

## Fix
1. Add `.plan-card.pro` class with `transform: scale(1.04)` and `z-index: 1` to visually lift it
2. Give it the orange border/shadow treatment: `border-color: var(--orange); box-shadow: 4px 4px 0 var(--orange)`
3. Change the badge text from "the film room upgrade" to "most popular" or "recommended"
4. Match the hover: `.plan-card.pro:hover { box-shadow: 6px 6px 0 var(--orange) }`

## Files
- `frontend/pricing.html` — add `.pro` class to the Pro card div
- `frontend/styles.css` — add `.plan-card.pro` and `.plan-card.pro:hover` rules (lines ~81-95)
