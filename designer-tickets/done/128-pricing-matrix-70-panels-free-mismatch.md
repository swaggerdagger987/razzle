# DES-128: Pricing matrix marks "70+ analytical panels" as free — contradicts product spec

**Priority:** P1 — Trust / Conversion
**Component:** pricing.html
**Affects:** Free-to-Pro conversion path

## Problem

The pricing page has two places that claim free users get "70+ analytical panels":

1. **Line 231**: Free celebration chip says `70+ analytical panels`
2. **Line 330**: Feature matrix row says `All 70+ analytical panels ✓` for Free, Pro, AND Elite

This contradicts NORTH_STAR.md (line 42): "Free users see these in the sidebar with lock icons. Pro/Elite users get full access. The panels are what turn a curious visitor into a paying user."

If the pricing page says free users get all 70+ panels, but the actual Lab shows most panels locked, users feel deceived. This is the #1 reason fantasy communities trash tools on Reddit — bait-and-switch.

## Evidence

- `pricing.html:231` — `<span class="free-chip">70+ analytical panels</span>`
- `pricing.html:330` — `<tr><td>All 70+ analytical panels</td><td class="yes">✓</td><td class="yes">✓</td><td class="yes">✓</td></tr>`
- `docs/NORTH_STAR.md:42` — "Free users see these in the sidebar with lock icons"

## Fix

1. **Line 231**: Change free chip to `70+ analytical panels (preview)` or remove it and keep `Screener (100+ columns)` as the free data chip
2. **Line 330**: Split into two rows:
   - `70+ analytical panels (preview)` → Free ✓, Pro ✓, Elite ✓
   - `Full panel access (unlocked)` → Free ✗, Pro ✓, Elite ✓

## Why it matters

r/DynastyFF users WILL notice. They verify everything. A user who signs up expecting 70+ free panels and finds them locked will post about it. One angry Reddit post about "bait-and-switch" pricing damages the brand permanently.
