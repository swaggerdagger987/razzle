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

## COMPLETED: Agent Presence Layers 1-3

Layers 1-3 shipped on ship/launch-fixes branch (2026-03-21):
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
