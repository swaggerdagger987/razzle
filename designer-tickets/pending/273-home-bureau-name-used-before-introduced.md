---
id: DES-273
title: Home page Pro card says "Bureau deep-dive" but page never introduces the Bureau name
priority: P2
page: index.html
category: conversion-copy
cycle: 26
---

## Problem

The home page Pro pricing card (index.html:815) lists "Full Bureau deep-dive" as a feature. But nowhere on the home page before the pricing section is the term "Bureau" or "Bureau of Intelligence" introduced.

Section 4 (lines 751-756) pitches the league connection feature with "Now connect your league. See what your rivals can't." and links to `/league-intel.html`. It never names this product "the Bureau." A first-time visitor reaches the pricing section and sees "Bureau deep-dive" without context — it's jargon for a product they haven't been introduced to.

The pricing page (pricing.html:387) also uses "Bureau" in the feature matrix but at least has more context around it.

## Evidence

- index.html:815 — Pro card: `<li>Full Bureau deep-dive</li>`
- index.html:751-756 — Section 4 says "connect your league" but never says "Bureau"
- index.html:754 — Copy: "Championship odds. Roster depth. Panic patterns. Trade targets." (describes Bureau features without naming it)
- NORTH_STAR.md:44 — "The Bureau of Intelligence (Free summary + Pro deep-dive)"
- DESIGN.md:25-26 — "The Bureau (Free, Sleeper-linked) — The hook."

## Fix

Either:
1. Add "the Bureau of Intelligence" name to section 4 heading or body copy (e.g., "Connect your league to the Bureau. See what your rivals can't.")
2. OR change the Pro card text from "Full Bureau deep-dive" to "Full league intelligence deep-dive" (avoids jargon)

Option 2 is simpler and avoids introducing brand terminology in a pricing card.

## Why This Matters

Unnamed features in pricing cards create confusion. Users scanning features to decide whether to pay should understand every line item without scrolling back up. "Bureau deep-dive" requires context they don't have.
