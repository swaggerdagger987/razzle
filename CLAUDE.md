# Razzle — Development Guide

## What Is This

Razzle is a fantasy football analytics platform at razzle.lol. A free Bloomberg terminal for fantasy football with a playful comic-strip aesthetic. Bengal tiger mascot named Razzle. Powered by nflverse + college stats. Monetized later through league-contextualized AI agents at $240/yr.

## Required Reading

Before writing ANY code, read these files in this order:
1. `docs/NORTH_STAR.md` — **The endgame.** This is what Razzle becomes. Every decision you make should move toward this document. When you hit a fork in the road, the north star resolves it.
2. `docs/ROADMAP.md` — The phased execution plan with exit criteria. Follow it exactly.
3. `docs/DESIGN.md` — Theme, colors, typography, visual language. All UI must match.
4. `PROGRESS.md` — What's been completed. **Start from where this file left off.**

## Product Decision-Making

You are not just a code executor. You are a product builder. When you encounter decisions not explicitly covered by the roadmap:

1. Read `docs/NORTH_STAR.md` and ask: **"Does this move toward the north star?"**
2. Apply the decision framework from the north star (bottom of that doc):
   - Does this help The Lab get screenshotted on Reddit?
   - Does this follow the design guide?
   - Does this move toward the three-layer architecture?
   - Is this the simplest version that works?
   - Would a Reddit power user care?
3. Make the call. Document your reasoning in `PROGRESS.md` under Decisions Log.
4. If a decision is truly ambiguous and high-stakes (would be expensive to reverse), note it as a blocker instead of guessing.

You should be opinionated. The north star gives you the values. The roadmap gives you the sequence. The design guide gives you the aesthetics. Between these three documents, most decisions are answerable without human input.

## Current Phase

Check `PROGRESS.md` to determine which phase you're in. Follow the roadmap phase-by-phase. **Do not skip phases. Do not start the next phase until the current phase's exit criterion is met.**

## Project Structure

```
razzle/
├── frontend/          # HTML, JS, CSS — no framework, browser-runnable
│   ├── index.html     # Landing page (home)
│   ├── lab.html       # The Lab (screener)
│   ├── league-intel.html
│   ├── agents.html    # Situation Room (later)
│   ├── styles.css     # Single stylesheet, follows DESIGN.md
│   ├── lab.js         # Screener logic
│   └── app.js         # Shared logic
├── backend/
│   ├── server.py      # FastAPI app — thin endpoints
│   └── live_data.py   # Data queries, all DB reads
├── adapters/
│   ├── nflverse_adapter.py  # NFL stats → SQLite
│   └── college_adapter.py   # NCAA stats → SQLite (Phase 1)
├── data/
│   └── terminal.db    # SQLite — single source of truth
├── scripts/           # One-off scripts, data imports
├── docs/
│   ├── NORTH_STAR.md  # Product vision — the endgame. Read first.
│   ├── ROADMAP.md     # Phased development plan
│   └── DESIGN.md      # Theme and design guide
├── CLAUDE.md          # This file
├── PROGRESS.md        # Completed work tracker
└── render.yaml        # Render deployment config
```

## Tech Stack

- **Frontend**: Vanilla HTML/JS/CSS. No React, no framework. Browser-runnable from local server.
- **Backend**: Python FastAPI. Thin endpoints in server.py, data logic in live_data.py.
- **Database**: SQLite (terminal.db). Sufficient for target scale (10k users).
- **Data sources**: nflverse (NFL stats via GitHub CSV releases), Sleeper API (leagues/rosters).
- **Hosting**: Render (static site + web service). Domain: razzle.lol via Namecheap.

## Design Rules (Summary — full guide in docs/DESIGN.md)

- Background: Anthropic sand `#ede0cf`, cards `#f7efe5`
- Accent: Tiger terracotta `#d97757` (Claude-esque orange)
- Fonts: Garfield/Luckiest Guy (display), Space Mono (data), Caveat (handwritten annotations)
- Borders: 3px solid ink, 4px 4px 0 offset box-shadows
- Position colors: QB=blue `#5b7fff`, RB=teal `#2ec4b6`, WR=terracotta `#d97757`, TE=purple `#8b5cf6`
- Loading states: "pulling film..." not "Loading..."
- NO dark mode (except Situation Room). NO gradients. NO thin 1px borders.
- Sticker/badge aesthetic, slightly rotated tier badges
- Trust the user — don't over-explain in UI

## Data Contracts

- Player IDs: use nflverse gsis_id as primary key when available, fallback to sleeper player_id
- All stat values stored as floats in SQLite
- Adapter pattern: each data source has its own adapter that normalizes to common schema
- Common schema writes to terminal.db — adapters handle fetch, clean, normalize
- Swap a data source = write a new adapter, no other code changes

## API Design

- All endpoints under `/api/`
- Return JSON
- Keep endpoints stable once shipped:
  - `GET /api/health`
  - `GET /api/players` — search/filter/paginate
  - `POST /api/screener/query` — complex multi-filter screener
  - `GET /api/filter-options` — autocomplete for search/position/team

## Frontend Rules

- Single `state` object as source of truth
- Pure render functions where possible
- Explicit loading/error states for every async flow
- URL state: serialize screener state (filters, sort, columns) to URL params
- localStorage for user formulas and saved views (no auth yet)

## Git

- **User**: swaggerdagger987
- **Email**: swaggerdagger987@users.noreply.github.com
- **Repo**: github.com/swaggerdagger987/razzle (private)
- Always set git config user.name and user.email before committing
- Commit after completing each task
- Push after completing each phase
- Commit messages: short, descriptive, no emojis

## Autonomous Work Rules

When running autonomously (no user input):

### Execution
1. Read `docs/NORTH_STAR.md`, then `PROGRESS.md`. Understand the vision, then find where you left off.
2. Follow the roadmap phase-by-phase. Do not skip.
3. Make your own decisions on implementation details — the north star, roadmap, and design guide have the constraints.
4. Update `PROGRESS.md` after completing each task.
5. Commit after each completed task.
6. If genuinely blocked (API down, missing critical info), document the blocker in PROGRESS.md and move to the next unblocked task.
7. Deploy to Render after completing each phase.
8. Reference the old FDL codebase at `C:\Users\mcgui\Documents\FDL` for proven patterns (especially live_data.py and nflverse sync logic) — but rewrite, don't copy.

### Product Thinking (Brainstormer Mode)
Between phases or when encountering non-trivial design/architecture decisions:
1. Re-read `docs/NORTH_STAR.md` to recalibrate.
2. Consider 2-3 approaches with trade-offs before choosing.
3. Pick the approach that best serves the north star's priorities (Lab quality → Reddit screenshots → conversion funnel).
4. Log the decision and reasoning in `PROGRESS.md` Decisions Log.
5. Bias toward shipping. A working ugly version beats a planned perfect version.
6. If a decision would significantly change the north star's architecture (new pages, different monetization, different data sources), document it as a proposed change in PROGRESS.md rather than implementing it unilaterally.

### Quality Checks
At the end of each phase, before moving to the next:
1. Re-read the phase's exit criterion from `docs/ROADMAP.md`. Is it actually met?
2. Re-read `docs/DESIGN.md`. Does the UI match? Chunky borders, right colors, right fonts?
3. Screenshot test: would a Reddit power user from r/DynastyFF screenshot this? If no, that's your priority before moving on.
4. Does the code follow the project structure? No files outside the defined folders.

## Reference Codebase

The old FDL project at `C:\Users\mcgui\Documents\FDL` has working implementations of:
- nflverse data sync (`live_data.py` — sync_nflverse_player_stats function)
- Sleeper API integration (`live_data.py` — fetch_sleeper_players_cached)
- Screener query logic (`live_data.py` — fetch_screener_query)
- Terminal server endpoints (`terminal_server.py`)
- **Pixel Situation Room** (`pixel-agents/index.html` — complete canvas engine, 51KB):
  - Canvas: 30×22 tile grid, 32px tiles, `image-rendering: pixelated`
  - Sprites: 16×24 frames, 7 cols × 4 rows, drawn at 2× scale (32×48)
  - Agent AI: state machine (IDLE/WALK/WORK_DESK/ANALYZE_BOARD/DISCUSS/THINK/COFFEE)
  - Collision system, furniture sprites, wood floor + turf war table
  - Walk animation: `WALK_FRAMES = [0, 1, 2, 1]` at 150ms/frame
  - Agent selection: click + dashed ellipse, camera follow, D-pad controls
- **Agent personas** (`agent-personas/` — 6 markdown files):
  - Hootsworth (Chief of Staff) → adapt to Razzle (Bengal Tiger)
  - Dr. Dolphin (Medical), Hawkeye (Scout), The Fox (Diplomat), The Octopus (Quant), The Elephant (Historian)
  - Each has personality, reasoning style, mandatory output sections
- **Agent integration** (`agents.html` + `agents.js`):
  - Scenario panel, per-agent API key config (OpenRouter), LLM calls from browser
  - 5 specialists run in parallel → Razzle synthesizes with urgency tiers
- **Character sprites** (`pixel-agents/assets/characters/char_0.png` through `char_5.png`)

Use these as reference for proven patterns, but rewrite everything clean for the razzle repo. Every line should be intentional.

## Razzle Loop (Autonomous Agent Workflow)

The Razzle Loop is an autonomous multi-agent workflow defined in `~/.claude/agents/razzle-loop.md`. It runs a recursive PLAN → DESIGN → BUILD → TEST → FIX loop with zero human stops.

- **Task tracker**: `LOOP-TASKS.md` (root of repo) — tracks current task, attempts, pass/fail
- **Activation**: Say "activate razzle loop" or "start the loop"
- **Agents used**: Sprint Prioritizer, UI Designer, Whimsy Injector, Frontend Developer, Evidence Collector, Reality Checker
- **Loop logic**: Each task gets max 3 attempts. PASS → commit + next task. FAIL → fix loop. All tasks PASS → phase gate → push.
- **Full autonomy**: The loop reads north star, roadmap, design guide, and progress tracker. It makes its own decisions. It does not stop to ask.
