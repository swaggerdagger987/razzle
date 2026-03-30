<!-- PM: ready -->
---
id: DES-338
priority: P2
area: tiers.html
section: tier row content
type: visual / readability
status: open
---

# Tiers page S/A tiers — 40+ player chips in 12px create unreadable visual wall

## What's wrong

The S and A tiers on the dynasty tier list page contain 40+ player chips each. With `gap: 6px` and `font-size: 12px`, these tiers become a dense wall of tiny text that defeats the purpose of a tier list (quick visual scanning).

A Reddit user would screenshot this to share their tier rankings, but the S-tier is so packed that you can't quickly find a player name without reading every chip sequentially.

## Where

`frontend/tiers.html`:
- `.tl-tier-players` container: lines 157-166, `gap: 6px`
- `.tl-player-chip`: lines 168-185, `font-size: 12px`, `padding: 4px 10px 4px 4px`

## Evidence

Screenshot: tiers-desktop.png — S-tier row has 40+ chips in what looks like a solid block of text. A-tier similarly packed. Lower tiers (D, F) are more readable because fewer players.

## Suggested fix

1. Increase gap from 6px to 10px — this alone makes a noticeable difference
2. Consider a "Top 10" default view with "Show all" expand for dense tiers
3. Or increase chip font from 12px to 13px (matches type scale minimum for data)
4. Add subtle row-break visual indicators every 10-15 chips (e.g., slightly larger gap)

## Why this matters

The tiers page is one of the most shareable pages for dynasty fantasy football. If the S-tier is an unreadable wall, users won't screenshot it. The fix is literally changing one CSS value.
