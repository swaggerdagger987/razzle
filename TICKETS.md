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

## Phase: P0 — League Intel Is Broken + Nav Names Changed Without Permission

**PRIORITY: P0 — core product page is broken and brand names were changed.**

### Task 1: Fix League Intel (Bureau of Intelligence)

**Accept when**: league-intel.html fully works again — Sleeper connection flow, league loading, odds cards, self-scout, trade finder, all Bureau features functional. Test the full flow: enter a Sleeper username, select a league, see odds cards. If any step fails, fix it. This was working before the ship loop touched it.

### Task 2: Restore original nav names

The ship loop renamed the navigation tabs. The correct names are:

- **"Fourth Down Lab"** (not "Lab" or "The Lab" or "Screener")
- **"Bureau of Intelligence"** (not "Bureau" or "League Intel")
- **"Situation Room"** (this one may be correct, verify)

These are the BRAND NAMES. They are not suggestions. Do not rename them to be "self-describing" or "simpler." The names ARE the brand.

**Accept when**: All navigation links, page titles, headers, and any references across the entire site use the exact names: "Fourth Down Lab", "Bureau of Intelligence", "Situation Room". Check: index.html nav, app.js nav builder, all page `<title>` tags, all H1/H2 headers, pricing page feature lists, any marketing copy. Grep for "League Intel", "The Lab", "AI Agents" and replace with the correct brand names.

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

## Phase: Autoresearch Engine — Synthetic User Simulation

**PRIORITY: Build this. Nothing is blocking it.** Playwright is installed. Claude API is available. This is pure Python logic.

**Design ref**: `docs/plans/2026-03-20-agent-connective-tissue-design.md` — Section "Autoresearch Self-Improvement Engine"

**Exit criterion**: 20+ user personas defined. Simulation runner executes full site journeys via Playwright with Sonnet making navigation decisions. All interactions instrumented and logged.

### Task 1: Create user persona definitions

**Accept when**: `self-improvement/personas/` directory contains 20+ JSON persona files. Each defines: id, description, experience level, league format, behavior type, goals, patience, upgrade likelihood, session length. Personas span: dynasty veteran, redraft casual, first-timer, trade junkie, data nerd, lurker, mobile-only, prospect obsessed, weekly grinder, commissioner, IDP enthusiast, DFS crossover, podcast listener, spreadsheet migrator, group chat screenshot sharer, auction league player, keeper league player, best ball player, superflex player, TE premium player.

### Task 2: Build simulation runner

**Accept when**: `self-improvement/simulate.py` runs a single simulated user journey:
1. Launches Playwright browser pointed at localhost:8000
2. Takes a screenshot at each navigation step
3. Sends screenshot + persona context to Sonnet via Claude API (`anthropic` Python SDK)
4. Sonnet responds with the next action (click element, scroll, hover, navigate, leave)
5. Executes the action, captures the result
6. Logs every interaction to `self-improvement/simulation-log.jsonl` with: persona, session id, step number, page, action, target element, agent callouts visible, agent callouts clicked, timestamp
7. Continues until persona "leaves" (Sonnet decides session is over) or max 50 steps
8. CLI: `python simulate.py --persona dynasty-veteran --sessions 5`

### Task 3: Build instrumentation layer

**Accept when**: The simulation runner captures per interaction: agent callout impressions, agent callout clicks, agent callout dismissals, hover duration on agent elements, navigation path, time-on-page, conversion events (pricing page visits), feature discovery (which panels found), session depth, session duration. All logged to `simulation-log.jsonl`.

### Task 4: Build batch runner

**Accept when**: `self-improvement/run_batch.py` runs N sessions per persona across all personas, parallelizes with configurable concurrency, aggregates results into `batch-results.json` with overall CTR, conversion rate, avg session depth, per-agent and per-persona breakdowns. CLI: `python run_batch.py --sessions-per-persona 10 --concurrency 2`

---

## Phase: Autoresearch Engine — Self-Reflection Loop

**PRIORITY: Build this right after simulation.** Same tools — Python + Claude API.

**Exit criterion**: Each agent produces insights and updated config. Razzle produces cross-agent strategy. Updated config deploys to frontend.

### Task 1: Build per-agent self-reflection runner

**Accept when**: `self-improvement/reflect.py` reads `simulation-log.jsonl` filtered to one agent's placements, calculates CTR/engagement metrics, sends data + agent persona to Claude API (Opus), agent writes insights markdown + updated placement/copy/timing JSON configs. CLI: `python reflect.py --agent dolphin` or `python reflect.py --all`

### Task 2: Build Razzle strategy session

**Accept when**: `self-improvement/strategize.py` reads all 6 agents' insight files, sends to Opus with Razzle's persona, Razzle writes cross-agent strategy markdown + stitching config JSON. CLI: `python strategize.py`

### Task 3: Build peer review runner

**Accept when**: `self-improvement/peer_review.py` has each agent review one other agent's proposed changes (rotation). Checks for brand drift, spam creep, territory conflicts. Flags go to Razzle for arbitration. CLI: `python peer_review.py`

### Task 4: Build config deployment

**Accept when**: `self-improvement/deploy_config.py` merges approved configs into `frontend/agent-config-optimized.json`, bumps versions, logs to `optimization-log.tsv`. Frontend reads optimized config at runtime if it exists, falls back to defaults.

### Task 5: Build full autoresearch cycle runner

**Accept when**: `self-improvement/run_cycle.py` orchestrates: simulate -> reflect -> strategize -> peer review -> deploy -> log. Optional `--auto-revert` reverts if metrics regress. CLI: `python run_cycle.py --sessions-per-persona 10`

---

## DEFERRED PHASES (need MiroFish service — build post-launch)

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
