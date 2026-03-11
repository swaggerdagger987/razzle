# Platform Loop — Phase 132 Task List

## Status
Current Phase: 132 (Pricing + Agent Branding + Health Check)
Current Task: COMPLETE
Current Stage: PHASE GATE
Attempt: -
Tasks Completed: 5/5
Loop Iterations: 5

---

## Task 1: Fix landing page pricing to two-tier Pro/Elite
**Requirement**: "Tier 1 ('Pro') at $9.99/month ($79.99/year)... Tier 2 ('Elite') at $19.99/month ($149.99/year)" (Pricing Strategy)
**Accept when**: Landing page shows two pricing cards (Pro and Elite) with correct prices. Demo section and waitlist text updated. No references to $240/yr or $20/mo remain.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS

## Task 2: Update agent emojis and animal names across landing page and demo
**Requirement**: "Scout=Eagle, Medical=Owl, Diplomat=Bear, Quant=Fox, Historian=Elephant" (Phase 131 Decisions Log)
**Accept when**: Landing page demo briefings use correct animal emojis. Agent bio cards show correct animal names. No generic emojis (hospital, chart, books) remain for agents.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS

## Task 3: Update Situation Room (agents.html) agent names and colors
**Requirement**: Agent persona files define names and animals. Bio grid and hero badges should match.
**Accept when**: agents.html hero badges, bio grid, and warroom.js AGENTS array all use correct animal names and emojis matching persona files.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS

## Task 4: Deepen health check endpoint
**Requirement**: "Health check: verify Turso + users.db + query execution time" (Backend Audit)
**Accept when**: GET /api/health returns status of main DB (terminal.db) connectivity, users.db connectivity, and query execution time in milliseconds. Returns 503 if any check fails.
**Depends on**: none
**Size**: S
**Primary role**: BACKEND
**Status**: PASS

## Task 5: Add pricing page / section to agents.html with upgrade CTA
**Requirement**: "Paywall UI gating... Free users see generic, paid content teased but gated" (Phase 8 ROADMAP) and "Upgrade CTAs feel like invitations, not roadblocks" (System Prompt)
**Accept when**: agents.html has a visible pricing/upgrade section matching the two-tier Pro/Elite structure from Pricing Strategy, with feature comparison relevant to Situation Room.
**Depends on**: Task 1
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS
