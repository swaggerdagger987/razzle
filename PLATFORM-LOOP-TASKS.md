# Platform Loop — Phase 156 Task List

## Status
Current Phase: 156 (Situation Room — First-Run Demo Briefing)
Current Task: 2
Current Stage: COMPLETE
Attempt: 1/3
Tasks Completed: 2/2
Loop Iterations: 2

---

## Phase Rationale

The North Star conversion funnel requires: "User hits a decision point -> generic agent answer is fine, but league-contextualized answer from the Situation Room is clearly better -> converts."

When a user first visits agents.html, they see the pixel canvas and an empty briefing zone with a scenario input. Without an API key configured, they have no idea what agent output looks like. The first-run demo briefing shows pre-rendered sample briefing cards (identical styling to real output) that demonstrate:
1. What each agent's output looks like
2. The Razzle synthesis with urgency tier
3. Cross-agent follow-up triggers
4. The free vs paid gap (each card has italicized hints showing what league context would add)
5. A conversion CTA at the bottom

This creates the "aha moment" before the user even configures anything.

---

## Task 1: First-Run Demo Briefing Cards
**Requirement**: "User sees Situation Room demo -> curiosity builds" + "generic vs league-contextualized gap is obvious" from North Star.
**Accept when**: (1) Pre-rendered sample briefing cards appear in briefing zone on first visit. (2) Razzle synthesis card expanded, 5 specialist cards collapsed. (3) Cross-agent follow-up section visible. (4) Demo badge on each card. (5) Free vs paid hints on each card. (6) Conversion CTA at bottom. (7) Dismissed via localStorage, auto-clears on first real query.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS — DEMO_BRIEFINGS object, showFirstRunDemo(), renderDemoCard(), dismissFirstRunDemo(), razzle:agents-starting event dispatch

## Task 2: QA + Syntax Verification
**Requirement**: No JS errors, pages serve correctly.
**Accept when**: (1) warroom.js passes node --check. (2) agents.html inline JS passes. (3) Both pages serve 200.
**Depends on**: Task 1
**Size**: S
**Primary role**: QA
**Status**: PASS — warroom.js syntax OK, agents.html JS OK, both pages serve 200
