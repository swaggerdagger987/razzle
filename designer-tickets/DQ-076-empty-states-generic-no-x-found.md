---
id: DQ-076
priority: P2
category: voice/copy
status: open
---

# DQ-076: 16+ pages use generic "no X found" empty states — no personality

## Problem
DESIGN.md says loading/empty states need personality ("pulling film...", not "Loading..."). But **16+ pages** use generic `"no [label] found for this filter"` empty state messages with no Razzle voice.

Affected files:
- airyards.html (lines 584, 621)
- archetypes.html (line 453)
- awards.html (line 577)
- breakouts.html (line 555)
- buysell.html (line 645)
- consistency.html (line 553)
- efficiency.html (line 551)
- index.html (line 976: "no players found")
- opportunity.html (line 584)
- redzone.html (line 551)
- reportcard.html (line 590)
- schedule.html (line 563)
- stocks.html (line 592)
- vorp.html (line 546)
- lab-panels.js (line 3891)

## Fix
Use `razzleEmpty()` from app.js (already exists) or create position-aware empty states:
- "the film room's empty for this filter"
- "nothing on the tape here — try loosening the filters"
- "no matches on this reel — adjust your search"

The home page mini-screener (index.html:976) is especially visible — "no players found" is the blandest possible copy for a first-time visitor.

## Scope
16 files, 1 string replacement each. Write 3-4 personality variants and rotate.
