# Platform Loop — Phase 137 Task List

## Status
Current Phase: 137 (Landing Page Conversion Polish)
Current Task: COMPLETE
Current Stage: PHASE GATE
Attempt: -
Tasks Completed: 3/3
Loop Iterations: 3

---

## Task 1: Auto-rotating Situation Room demo on landing page
**Requirement**: "Agents visibly working but content redacted. Rotates on each visit." (North Star, Phase 8)
**Accept when**: Demo briefing cards auto-rotate every 8 seconds with a smooth fade transition. Each rotation shows 3 cards from different agents. A subtle "agents are briefing..." animation plays during transitions. The demo feels alive, not static. A manual "shuffle" button also exists.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS

## Task 2: "See what they'd say about YOUR roster" conversion CTA
**Requirement**: "See what [Agent Name] thinks about YOUR roster — personalized conversion hooks" (Design rules, paywall design)
**Accept when**: Below the rotating demo cards, a personalized CTA appears: "This is a real manager's Situation Room. Connect Sleeper to get yours." If Sleeper is already connected but user is free, CTA becomes "[Agent] would tell you about [YOUR PLAYER from their roster] — upgrade to unlock." CTA links to auth modal or Sleeper connection flow.
**Depends on**: Task 1
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS

## Task 3: Feature comparison table on pricing section
**Requirement**: "The difference is obvious and compelling" (Phase 8 exit criterion)
**Accept when**: The agents.html pricing section includes a clear feature comparison table showing Free vs Pro vs Elite with checkmarks/X marks. Table is styled in Razzle design (chunky borders, position colors). Key differentiators are visually highlighted: league context, agent memory, weekly briefings, FAAB intel. Table feels like an invitation, not a wall.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS
