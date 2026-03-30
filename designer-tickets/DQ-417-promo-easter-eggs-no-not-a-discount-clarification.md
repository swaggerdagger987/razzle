---
id: DQ-417
title: Promo code easter eggs (TIGER, GOAT) don't clarify they're not real discounts
priority: P2
category: UX / conversion
page: pricing.html
cycle: 53
---

## Problem

The pricing page has easter egg promo codes (TIGER, GOAT) that show fun Razzle-personality messages when entered. However, the messages don't explicitly state "this isn't a real discount." A user entering TIGER sees a fun response and might assume a discount was silently applied to their plan.

## Evidence

From pricing.html lines 610-614:
- TIGER → shows personality message
- GOAT → shows personality message
- Neither says "no discount applied" or "just for fun"

## Fix

Append clarifying text to each easter egg response:
```
"Razzle approves. 🐾 (No discount — but you've got style.)"
```

Make it clear the promo code is flavor, not function. The parenthetical keeps it on-brand.

## Files
- `frontend/pricing.html` — promo code handler (~lines 610-614)
