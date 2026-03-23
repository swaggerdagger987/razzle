---
id: DQ-208
priority: P2
category: voice / consistency
status: open
---

# Loading messages inconsistent across 12+ standalone pages

## Problem

DESIGN.MD prescribes personality-driven loading states: "pulling film..." not "Loading..." The codebase has a mix of ~8 different loading message styles across pages. While most avoid generic "Loading...", the variation feels like each page was built by a different team.

## Evidence

| Message | Pages using it |
|---------|---------------|
| "pulling film..." | dashboard, auction, archetypes, cheatsheet, compare, draftclass, drops, fptsbreakdown, gamescript, advantage + ~10 more |
| "studying the tape..." | aging |
| "studying the market..." | buysell |
| "scouting the film..." | breakouts |
| "checking the tape..." | consistency |
| "running the numbers..." | efficiency |
| "calculating trade values..." | tradevalues |
| "calculating replacement value..." | vorp |
| "analyzing air yards data..." | airyards |
| "crunching the data..." | dualthreat |
| "crunching numbers..." | explorer |
| "tallying the votes..." | awards |

## Problem statement

This isn't about eliminating personality — it's about the brand feeling inconsistent when navigating between pages. "pulling film..." is the canonical Razzle voice. The others vary wildly in tone: "calculating replacement value..." is clinical/technical, "tallying the votes..." is playful but different from the film metaphor.

## Fix

Pick 3-4 approved loading messages that all fit the film/tape room metaphor and rotate:
1. "pulling film..." (canonical)
2. "checking the tape..." (variation)
3. "running the numbers..." (acceptable — analytics voice)
4. "studying the tape..." (variation)

Replace outliers ("calculating replacement value...", "analyzing air yards data...", "tallying the votes...") with one of the approved set. Or create a shared `razzleLoading()` helper that returns a random approved message.

## Files
- 12+ standalone HTML files in `frontend/`
