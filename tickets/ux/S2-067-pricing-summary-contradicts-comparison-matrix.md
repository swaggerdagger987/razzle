---
id: S2-067
severity: S2
confidence: HIGH
category: conversion
source: DQ-292
status: OPEN
---

# Pricing summary text contradicts comparison matrix — Elite-only features unlisted

## Root Cause

`frontend/pricing.html:327`:
> "Pro gives you the full film room. Elite removes all limits and runs the AI for you — no API key needed."

But the comparison matrix at lines 373-374 shows TWO features that are Elite-only:
- **Agent memory** — Pro: dash, Elite: checkmark
- **Weekly briefings** — Pro: dash, Elite: checkmark

The summary text implies Elite only differs in "no API key needed." Users who read the summary think Pro and Elite are identical except for API setup. Users who study the matrix discover Elite-exclusive features. Trust erosion at purchase decision.

## Fix

Option A (recommended): Update line 327:
> "Pro gives you the full film room. Elite adds agent memory, weekly briefings, and runs the AI for you — no API key needed."

Option B: Move Agent memory and Weekly briefings to Pro tier.

## Files

- `frontend/pricing.html:327` — summary text
- `frontend/pricing.html:373-374` — comparison matrix Elite-only rows

## Acceptance Criteria

- Summary text accurately describes ALL Pro vs Elite differences
- No contradiction between summary and comparison matrix
