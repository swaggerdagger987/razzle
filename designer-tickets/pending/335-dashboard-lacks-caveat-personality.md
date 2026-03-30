# DES-335: Dashboard page lacks Caveat personality annotations

**Priority**: P2
**Category**: Brand Voice — Visual Personality
**Affects**: frontend/dashboard.html
**Cycle**: 4 (visual QA)

## Problem

The breakouts page (breakouts.html) has excellent Caveat handwritten annotations under each player card — "a due for a buy", "opportunity brewing", "the pop is real". These give the page the comic-strip personality that defines the Razzle brand.

The dashboard page (dashboard.html) has zero personality. It's purely functional — data cards, stat numbers, labels. No Caveat annotations, no playful copy, no margin notes. It looks like a generic analytics dashboard, not like it belongs to the same product as breakouts.html.

## Evidence

Side-by-side screenshot comparison:
- breakouts.html: each card has a Caveat annotation below the stats providing editorial flavor
- dashboard.html: Top 5 cards show player name + trade value number + position badge, with no editorial commentary at all

## Fix

Add 1-2 Caveat annotations per section on dashboard.html:
- Top 5: a subheading annotation like *"the five names everyone's talking about"*
- Rising Stocks: *"trending up — get them before your leaguemates notice"*
- Falling Stocks: *"sell window closing"*

Use `font-family: var(--font-hand)` at 18-20px per DESIGN.md: "Caveat is never primary information. Always a comment, aside, margin note."

## Why it matters

DESIGN.md says personality "leaks through the seams" via Caveat annotations. The dashboard is a high-traffic page (likely the first thing Pro users see). Without personality, it feels generic. With 2-3 Caveat annotations, it feels like Razzle — your slightly smug, highly competent tiger is annotating the data for you.
