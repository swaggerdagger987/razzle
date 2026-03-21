# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

## DESIGN REFERENCE

All tickets below implement the Agent Connective Tissue design. Full design doc: `docs/plans/2026-03-20-agent-connective-tissue-design.md`. Read it before starting any ticket.

---

## Phase: P0 — Agent Presence Is Invisible (Ship Loop Claimed Done But Nothing Shows)

**PRIORITY: P0 — the entire agent connective tissue design is not visible on the live site.**

The ship loop marked Agent Layers 1-3 as "COMPLETED" but the founder cannot see any agent presence anywhere on the site. The code exists (agent-config.js, agent-nudges.js, SVG icons in assets/agents/) but agents are NOT visible to users. This needs to be verified and fixed.

**Design ref**: `docs/plans/2026-03-20-agent-connective-tissue-design.md`

The agents should be the personality of the site. Right now the site feels the same as before — no agent icons, no agent-voiced loading states, no margin notes, no personality layer. The whole point of the connective tissue design was to make the agents FELT across every page.

### Task 1: Audit what actually renders on the live site

**Accept when**: Browse every page (index, lab, league-intel, agents, pricing) on localhost:8000 and screenshot each one. For each page, document:
- Are agent SVG icons visible anywhere? (column tooltips, panel headers)
- Are loading states using agent-voiced Caveat-font copy? ("checking the injury wire...", "scanning the tape...")
- Are empty states using agent personality? ("Nothing worth your time right now.")
- Are margin notes visible on any panels?
- Does the 404 page use Razzle's voice?
- Do panel subtitles show agent attribution? ("Dr. Dolphin — Medical Analyst")
If ANY of these are missing, fix them. The agent-config.js territory map defines what goes where.

### Task 2: Make Layer 1 visible to FREE users

**Accept when**: A free user (not logged in) visiting the Lab sees:
- Caveat-font loading states with agent personality when data loads
- Agent-voiced empty states when no results match
- 16px agent avatar icons in column header tooltips (hover to see "Dr. Dolphin — Medical Analyst")
- 20px agent icons + name in panel subtitle/attribution lines
- These are NOT gated behind Pro/Elite — they are the free personality layer
- Verify by opening in an incognito browser with no auth

### Task 3: Make Layer 1 visible on Bureau

**Accept when**: A free user visiting the Bureau (league-intel.html) sees:
- Agent-voiced loading states (Octo: "running the numbers...", Bones: "reading the room...")
- Agent attribution on Bureau sections
- The same personality treatment as the Lab

### Task 4: Verify ambient character peek works

**Accept when**: Refresh any page 10+ times. On roughly 1 in 7 loads, a character sprite peeks from the margin. If this doesn't work, implement it — a small agent sprite (contextual to the page) slides in from the right edge, is dismissible on click, does not shift layout.

### Task 5: Verify rarity watermarks on screenshot exports

**Accept when**: Export a screenshot from the Lab screener. The watermark includes a random agent sprite (1/6 chance each agent) alongside "razzle.lol" text. If this doesn't work, implement it.

### Task 6: Deploy to production

**Accept when**: All changes from Tasks 1-5 are committed, pushed to master, and verified on razzle.lol (not just localhost). The live site shows agent personality on every page load.

---

## PREVIOUSLY CLAIMED COMPLETED (needs verification)

The ship loop claimed Layers 1-3 were done. The code exists but may not be rendering. After Task 1 above verifies what's actually working, update this section:
- Layer 1: SVG icons, agent-config.js, loading/empty/error states, tooltips, panel headers, 404, Bureau
- Layer 2: Sidebar agent attribution, one-liner insights (Pro-gated)
- Layer 3: Elite nudge system (agent-nudges.js, 12 cross-product nudges)
- Rarity watermarks (random character on screenshot exports)
- Ambient character peek (1/7 page load)
- Weekly briefing in Situation Room (Pro+)
- FAAB Strategy panel in Lab

---

## REMAINING PHASES (require external infrastructure)

The following phases require Playwright, Claude API credentials, and/or MiroFish service. They should be built when infrastructure is ready.

### Phase: Autoresearch Engine — Synthetic User Simulation
- 20+ user persona JSON files
- Playwright + Sonnet simulation runner
- Interaction instrumentation + logging
- Batch runner for parallel persona sessions

### Phase: Autoresearch Engine — Self-Reflection Loop
- Per-agent self-reflection (Opus)
- Razzle cross-agent strategy synthesis
- Peer review runner
- Config deployment pipeline

### Phase: MiroFish Integration — Decision Sandbox (Pro)
- MiroFish backend service + adapter
- Branching timeline SVG UI
- Decision Sandbox page

### Phase: MiroFish Integration — Season Simulator (Elite)
- Full season simulation endpoint
- Season Simulator page with progress UI
- Agent narration layer on timeline nodes

### Phase: Verification — Agent Connective Tissue
- Free/Pro/Elite tier experience verification
- Design compliance check (DESIGN.md alignment)

Full task specs are in `docs/plans/2026-03-20-agent-connective-tissue-design.md`.
