---
id: DQ-228
title: Easter egg promo codes exist but have zero discovery path — wasted conversion tool
priority: P2
category: conversion
status: open
cycle: 32
---

## Problem

The pricing page has a promo code input field and at least 3 working codes (RAZZLEDAZZLE, TIGER, GOAT). But:
1. No user knows these codes exist
2. No social media post references them
3. No email welcome flow distributes them
4. No "early adopter" messaging hints at them
5. The promo input exists but sits empty with no context

Promo codes are a powerful conversion tool — they create urgency and reward engagement. But only if people know they exist. Right now this is a fully built feature with zero distribution.

## Evidence

- `frontend/pricing.html:331-338` — Promo code input + validation logic
- Codes validated client-side (visible in source — security concern too, but separate issue)

## Fix

**Option A** (immediate): Add a hint near the promo input: "Follow @razzle_lol for exclusive codes"

**Option B** (better): Distribute codes through:
- Welcome email after registration
- Twitter/Reddit posts during launch
- Reddit flair for early community members
- Trial expiry email ("use RAZZLEDAZZLE for 20% off")

**Option C** (also needed): Move promo validation server-side so codes aren't visible in page source.

## Files
- `frontend/pricing.html:331-338` (promo section)
