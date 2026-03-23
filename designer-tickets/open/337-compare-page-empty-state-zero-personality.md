---
id: DES-337
priority: P2
area: compare.html
section: empty state
type: visual / UX
status: open
---

# Compare page empty state is barren — no illustration, no guidance, no personality

## What's wrong

When a user hits compare.html with no player IDs (from a dead link, direct nav, or shared URL that lost params), they see:

- "need two player IDs to compare" in Caveat 22px, ink-light
- One orange "Back to Screener" button
- 90% empty sand

No tiger mascot, no helpful instructions ("select two players in the Screener and click Compare"), no illustration. The page feels broken, not intentionally empty.

## Where

`frontend/compare.js` lines 25-29 — the empty state render block. CSS at `.compare-loading-text` lines 288-291.

## Evidence

Screenshot: compare-desktop.png — vast sand with a single italic line and one button. Compare this to the breakouts page which has a full illustration, subtitle, and agent attribution even before data loads.

## Suggested fix

1. Add the tiger mascot illustration (or a Caveat annotation like "pick two players in the Lab first, boss")
2. Add a brief how-to: "Select two players in the Screener, or paste a compare URL"
3. Show 2-3 example compare links to popular player comparisons (drives engagement)
4. Give the empty state card the chunky border treatment — make it feel designed, not abandoned

## Why this matters

Compare URLs are shareable. When they break (param lost, player removed), this is the first thing a user sees. A barren page says "this site is unfinished." A designed empty state says "we thought about this."
