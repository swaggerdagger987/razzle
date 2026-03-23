---
id: DES-274
title: Demo briefing cards reference specific players — no seasonal freshness mechanism
priority: P2
page: index.html
category: content-freshness
cycle: 26
---

## Problem

The Situation Room demo briefing cards on the home page (index.html:766-773) reference specific players and scenarios:

- **Razzle card** (line 768): "Keenan Allen" (34 years old in 2026, may retire), "Dynasty or Bust", "Taco Tuesday", FAAB bid $47/$52, championship odds 6.2% to 11.8%
- **Bones card** (line 772): "Diontae Johnson" (had off-field legal issues in 2024-2025), "RedZoneKing_99", "De'Von Achane", "2026 2nd" draft pick

These demo cards are the #1 selling point for the Situation Room — they show visitors what personalized AI briefings look like. If the player names feel stale or reference players who retired/had controversies, the demo loses credibility with the dynasty audience who tracks every transaction.

The "2026 2nd" draft pick reference will be outdated by 2027.

## Evidence

- index.html:768 — Keenan Allen waiver claim scenario
- index.html:772 — Diontae Johnson trade scenario with 2026 2nd
- No mechanism to update these seasonally (hardcoded HTML)

## Fix

1. Update player names to current relevant players each offseason (manual process)
2. Consider using younger, less volatile names: rising stars who'll be relevant for 2+ years
3. Change "2026 2nd" to a relative reference like "your mid-round 2nd" to avoid date staleness
4. Optionally: make demo content a JS array that rotates 3-4 scenarios on each visit

## Why This Matters

The dynasty audience on r/DynastyFF knows every player situation. Stale or controversial player names in demo content signal "this tool isn't maintained" — the opposite of the "up-to-date intelligence" positioning.
