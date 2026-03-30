---
id: DQ-292
title: Pricing "same features" statement contradicts comparison matrix Elite-only items
priority: P1
category: conversion / copy
page: pricing.html
status: open
cycle: 39
---

## What's wrong

Line 327 says:
> "Pro and Elite have the same features. The only difference is who provides the AI."

But the comparison matrix at lines 374-375 shows TWO features that are Elite-only (dash marks for Pro):
- **Agent memory** — Pro: dash, Elite: checkmark
- **Weekly briefings** — Pro: dash, Elite: checkmark

This is a factual contradiction on the pricing page. Users who read the summary text think Pro and Elite are identical except for API key setup. Users who study the matrix discover two Elite-exclusive features. This erodes trust at the exact moment of purchase decision.

## Evidence

- Line 327: `Pro and Elite have the same features. The only difference is who provides the AI.`
- Line 374: `<tr><td>Agent memory</td><td class="no">&mdash;</td><td class="no">&mdash;</td><td class="yes">&#10003;</td></tr>`
- Line 375: `<tr><td>Weekly briefings</td><td class="no">&mdash;</td><td class="no">&mdash;</td><td class="yes">&#10003;</td></tr>`

## Fix

Either:
- **Option A**: Change line 327 to: "Pro and Elite share most features. Elite adds agent memory and weekly briefings."
- **Option B**: Move Agent memory and Weekly briefings to Pro tier (make them truly the same)

Option A is safer — it preserves the Elite upsell while being honest.

## Not a dupe of

- DQ-216 covers the "difference buried at bottom" issue — this ticket is about the statement being FACTUALLY WRONG, not just badly positioned
- pending-218 covers Pro feature list mismatch between home/pricing — this is about the SAME PAGE contradicting itself

## Files
- `frontend/pricing.html` line 327
