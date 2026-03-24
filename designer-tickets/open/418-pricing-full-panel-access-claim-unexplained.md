# DQ-418: "Full Panel Access" pricing feature claim never explained

**Priority**: P2
**Category**: Conversion / Copy Accuracy
**Files**: `frontend/pricing.html`

## Problem

The pricing feature comparison matrix includes a row:

> "Full panel access (unlocked)" — Free: X, Pro: check, Elite: check

But nowhere on the page (or anywhere else on the site) does it explain:
1. What "full panel access" means
2. Which panels are locked for free users
3. What "unlocked" means in this context

## What the user sees

- Reads pricing comparison table
- Sees "Full panel access (unlocked)" with a checkmark for Pro/Elite and X for Free
- Thinks: "What panels? What's locked? Am I missing something on the free tier?"
- If they go to the Lab, all panels appear accessible (the gating logic may not be visible)
- Confusion about what they're paying for

## Why it hurts

Vague feature claims reduce perceived value. If a user can't understand what a feature IS, they can't value it. This row either needs to explain what it means or be removed.

## Fix

Either:
1. Replace with specific copy: "70+ analytical panels (dynasty rankings, trade values, breakouts, aging curves, and more)"
2. Or link to a panel list/preview showing exactly what's included
3. Or remove the row if all panels are actually free (and the Lab panels are indeed forever free per DESIGN.md)
