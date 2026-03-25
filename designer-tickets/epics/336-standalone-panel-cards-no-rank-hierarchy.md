---
id: DES-336
priority: P2
area: standalone panel pages (breakouts, buysell, consistency, etc.)
section: player cards
type: visual hierarchy
status: open
---

# Standalone panel pages show all player cards at identical visual weight

## What's wrong

On pages like breakouts.html, buysell.html, consistency.html, and other standalone panel pages, every player card is rendered at the exact same size, padding, border weight, and visual prominence. The #1 breakout candidate looks identical to #30. There is no visual hierarchy that draws the eye to the top results.

These pages are meant to surface insights — "here are the players you should be looking at." But when every card looks the same, no player stands out, and the page reads as a wall of equal-weight boxes.

## Where

All standalone panel pages that render player cards in a list: `breakouts.html`, `buysell.html`, `consistency.html`, `opportunity.html`, `reportcard.html`, `awards.html` (when unlocked), etc.

## Evidence

Breakouts page screenshot: 30+ player cards stacked vertically, all identical dimensions, borders, and spacing. No visual difference between the #1 ranked player and the last.

## Suggested fix

Pick one or combine:

**Option A (top-3 spotlight):** Make the top 3 cards larger with thicker borders (3px vs 2px), stronger box-shadow, and a subtle accent tint. Like podium positions.

**Option B (progressive fade):** Gradually reduce card visual weight as rank increases — top cards get full borders and shadows, bottom cards get lighter/thinner treatment.

**Option C (tier grouping):** Group cards into visual tiers (Top 5 / Next 10 / Rest) with tier sticker labels and spacing between groups.

**Option D (hero card):** Make the #1 result a "hero" card that spans full width with extra stats, while the rest are compact rows below it.

## Why this matters

These pages are screenshot magnets on Reddit — "check out these breakout candidates." If the visual doesn't naturally draw attention to the top results, the page fails its purpose. Visual hierarchy IS the insight delivery mechanism.
