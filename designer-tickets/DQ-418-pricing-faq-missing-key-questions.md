---
id: DQ-418
title: Pricing FAQ missing 3 common questions users will ask before buying
priority: P2
category: conversion / copy
page: pricing.html
cycle: 53
---

## Problem

The pricing page FAQ covers basic questions (Pro vs Elite, trial, cancellation, Sleeper, API keys) but misses three questions a prospective buyer will have:

1. "Can I switch from Pro to Elite (or downgrade)?" — No mention of plan switching
2. "What happens if I cancel mid-billing-period?" — Do I keep access until end of period?
3. "Can I use my account across multiple Sleeper leagues?" — Critical for dynasty players in 3+ leagues

These are common purchase-hesitation questions. Missing answers = abandoned checkout.

## Fix

Add 3 FAQ items:

**"Can I switch plans?"**
"Yes. Upgrade from Pro to Elite anytime — you'll get prorated credit. Downgrade takes effect at next billing cycle."

**"What happens if I cancel?"**
"You keep full access until the end of your current billing period. After that, you're back to the free Screener — no data lost."

**"Does it work with multiple leagues?"**
"Yes. Connect as many Sleeper leagues as you want. Switch between them in the Bureau."

## Files
- `frontend/pricing.html` — FAQ section (~lines 395-445)
