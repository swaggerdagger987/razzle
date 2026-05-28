# Razzle — Development Guide

## What Is This

Razzle is a fantasy football analytics platform at razzle.lol. A free fantasy football research lab with a playful comic-strip aesthetic. Bengal tiger mascot named Razzle. Powered by nflverse + college stats. Monetized through Pro ($9.99/mo, $79.99/yr) and Elite ($19.99/mo, $149.99/yr) tiers.

## Required Reading

Before writing ANY code, read these files in this order:
1. `docs/NORTH_STAR.md` — **The endgame.** This is what Razzle becomes. Every decision you make should move toward this document. When you hit a fork in the road, the north star resolves it.
2. `docs/DESIGN.md` — Theme, colors, typography, visual language. All UI must match.
3. `docs/DECISIONS.md` — Locked V2 architecture calls. Do not reverse without a dated entry here.
4. `docs/v2/STATUS.md` — **Live operational status.** Current cycle, focus, blockers. Start here for where work left off.
5. `docs/v2/PARITY.md` — Vertical backlog — one slice per cycle.
6. `docs/v2/ACCEPTANCE.md` — Localhost finish-line gates.

Full docs index: `docs/README.md`. Legacy quarry rules: `legacy/README.md`.
Company automation roles: `docs/company/README.md`.

## Product Decision-Making

You are not just a code executor. You are a product builder. When you encounter decisions not explicitly covered by the roadmap:

1. Read `docs/NORTH_STAR.md` and ask: **"Does this move toward the north star?"**
2. Apply the decision framework from the north star (bottom of that doc):
   - Does this help The Lab get screenshotted on Reddit?
   - Does this follow the design guide?
   - Does this move toward the three-layer architecture?
   - Is this the simplest version that works?
   - Would a Reddit power user care?
3. Make the call. Document irreversible choices in `docs/DECISIONS.md` with a dated entry. Log slice progress in `docs/v2/COUNCIL.md` or update `docs/v2/STATUS.md` when milestones shift.
4. If a decision is truly ambiguous and high-stakes (would be expensive to reverse), note it as a blocker in `docs/v2/STATUS.md` instead of guessing.

You should be opinionated. The north star gives you the values. PARITY gives you the next slice. The design guide gives you the aesthetics. Between these documents, most decisions are answerable without human input.

When acting as a company role (Chief of Staff, Product Strategist, Engineering Architect, Builder, Data Researcher, or Reality Checker), read `docs/company/OPERATING_SYSTEM.md` and the relevant file in `docs/company/roles/` before proceeding.

## Current Work

Check `docs/v2/STATUS.md` and `docs/v2/LOOP-STATE.md` for the active cycle and focus. Pick **one vertical slice** from `docs/v2/PARITY.md` per loop iteration. Do not horizontal-port legacy HTML pages.

## Project Structure

```
razzle/
├── apps/
│   ├── api/             # FastAPI — routers/, services/, adapters/, migrations/
│   │   └── legacy_bridge.py   # ONLY entry to legacy/ quarry
│   └── web/             # Next.js 15 — app/, components/, lib/
├── packages/
│   ├── ui/              # Design tokens + shared primitives
│   ├── types/           # Shared Zod schemas + TS types
│   ├── panels/          # Canonical panel catalog (@razzle/panels)
│   ├── agents/          # Agent registry
│   └── hallway/         # Connective tissue helpers
├── data/                # terminal.db, users.db (gitignored)
├── docs/                # Product + V2 ops docs — see docs/README.md
├── agent-personas/      # Six LLM system prompts
├── infra/               # Dockerfile, fly.toml, render.yaml
├── legacy/              # V1 quarry — read-only via legacy_bridge
├── scripts/             # Data sync (dev_stack.sh, sync_data.py)
├── graveyard/           # Retired systems pending deletion — do not read
└── CLAUDE.md            # This file
```

## Tech Stack

- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind v4, TanStack Query/Table/Virtual, Zod, nuqs.
- **Backend**: Python 3.12, FastAPI with `APIRouter` per domain, Pydantic v2, slowapi, Alembic.
- **Database**: SQLite (`terminal.db` stats + `users.db` auth/billing). Sufficient for target scale (10k users).
- **Data sources**: nflverse, cfbfastR, Sleeper API, ESPN injury feeds.
- **Auth/Billing**: JWT + bcrypt + Stripe (via legacy bridge until ported; see DECISIONS.md).
- **Hosting**: Fly.io API + Next.js. Cloudflare CDN. Domain: razzle.lol.

## Design Rules (Summary — full guide in docs/DESIGN.md)

- Background: Anthropic sand `#ede0cf`, cards `#f7efe5`
- Accent: Tiger terracotta `#d97757` (Claude-esque orange)
- Fonts: Garfield/Luckiest Guy (display), Space Mono (data), Caveat (handwritten annotations)
- Borders: 3px solid ink, 4px 4px 0 offset box-shadows
- Position colors: QB=blue `#5b7fff`, RB=teal `#2ec4b6`, WR=terracotta `#d97757`, TE=purple `#8b5cf6`
- Loading states: "pulling film..." not "Loading..."
- Site-wide dark mode toggle available. Situation Room is always dark regardless of toggle. Dark mode uses Espresso Flip palette (see DESIGN.md).
- NO gradients. NO thin 1px borders.
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
- Return JSON; validate with Pydantic v2 models in `apps/api/models/`
- One `APIRouter` per domain: screener, dynasty, analytics, bureau, agents, auth, billing
- Keep endpoints stable once shipped; generate TS types from OpenAPI for the web client
- Legacy data access only through `apps/api/legacy_bridge.py` — never import `legacy/` directly

## Frontend Rules

- URL is source of truth for screener state (nuqs)
- TanStack Query for server state; explicit loading/error/empty states for every async flow
- Design tokens from `packages/ui/tokens.css` — match DESIGN.md
- Panel catalog from `@razzle/panels` (canonical); avoid duplicating metadata in `apps/web/lib/panels/registry.ts`
- Loading copy: "pulling film..." not "Loading..."

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
1. Read `docs/NORTH_STAR.md`, then `docs/v2/STATUS.md` and `docs/v2/LOOP-STATE.md`. Understand the vision, then find where you left off.
2. Pick one vertical slice from `docs/v2/PARITY.md`. Do not horizontal-expand.
3. Make your own decisions on implementation details — north star, DECISIONS, and design guide constrain you.
4. Update `docs/v2/LOOP-STATE.md`, `docs/v2/STATUS.md`, and evidence in `docs/v2/evidence/` after completing a slice.
5. Commit after each completed slice when the loop or user expects it.
6. If genuinely blocked, document in `docs/v2/STATUS.md` and pick the next unblocked slice.
7. Reference `legacy/` only via `legacy_bridge.py` or as quarry for porting patterns.
8. Reference the old FDL codebase at `C:\Users\mcgui\Documents\FDL` for proven patterns — but rewrite, don't copy.

### Product Thinking (Brainstormer Mode)
When encountering non-trivial design/architecture decisions:
1. Re-read `docs/NORTH_STAR.md` to recalibrate.
2. Consider 2-3 approaches with trade-offs before choosing.
3. Pick the approach that best serves the north star's priorities (Lab quality → Reddit screenshots → conversion funnel).
4. Log irreversible decisions in `docs/DECISIONS.md` with a dated entry.
5. Bias toward shipping. A working ugly version beats a planned perfect version.
6. If a decision would significantly change the north star's architecture, document as a proposed change in COUNCIL.md rather than implementing unilaterally.

### Quality Checks
Before marking a slice done:
1. Re-read gate criteria in `docs/v2/ACCEPTANCE.md`. Attach evidence.
2. Re-read `docs/DESIGN.md`. Chunky borders, right colors, right fonts?
3. Screenshot test: would a Reddit power user from r/DynastyFF screenshot this?
4. `pytest apps/api/tests -q` and `npm run build` pass.

## Reference Codebase

**V1 quarry (this repo):** `legacy/` — read-only. See `legacy/README.md` and `PRESERVE.md`. Port patterns into `apps/api/services/`, do not extend legacy files.

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

## Razzle Company OS

Razzle runs as an AI-native company defined in `docs/company/`. Read in this
order when working as a company role:

1. `docs/company/STAGE.md` — current stage (deep build, no users)
2. `docs/company/OPERATING_SYSTEM.md` — principles, ethos, reconciliation
3. `docs/company/MEETINGS.md` — daily standup format + commit gate
4. `docs/company/AUTOMATION.md` — standard company loop + prompt template
5. `docs/company/SOP.md` — CEO-mode operating procedure and preserved loop ethos
6. `docs/company/NEXT.md` — current lead slice and backup candidate
7. `docs/company/SLACK.md` — operator cheat sheet for Slack-triggered runs
8. `docs/company/automations/` — Cursor Automation prompt specs (good-morning, ask-team, good-evening, tick)
9. `docs/company/roles/<role>.md` — role you are acting as
10. `docs/company/memory/<role>.md` — what this role learned in prior runs

**Cursor Cloud Agents read `AGENTS.md` at repo root first.** That file points
back into `docs/company/` and disambiguates which Automation spec to follow
based on the Slack trigger. Local Claude work in this IDE reads CLAUDE.md;
cloud-triggered runs read AGENTS.md. The two files complement each other.

**State / backlog / acceptance** stay in `docs/v2/`:

- `docs/v2/LOOP-STATE.md` — cycle counter, focus pillar/layer
- `docs/v2/STATUS.md` — live summary
- `docs/v2/PARITY.md` — vertical backlog (one slice per cycle)
- `docs/v2/DEPTH.md` — depth strategy
- `docs/v2/ACCEPTANCE.md` — localhost finish-line gates
- `docs/v2/COUNCIL.md` + `docs/v2/results.tsv` — ongoing logs

**Two AI systems — do not confuse:**

- `docs/company/roles/` = AI staff that **builds** Razzle
- `agent-personas/` = AI staff that ships **inside** Razzle to users (Razzle,
  Dolphin, Hawkeye, Fox, Octopus, Elephant), wired through `packages/agents/`
  and `apps/api/services/agents/`

The prior cofounder loop (`scripts/v2_loop.sh`, `loop-prompt-*.txt`,
`docs/v2/PROGRAM.md`, `COFOUNDERS.md`, `BOARD.md`, `LOOP.md`, `START-LOOP.md`,
`CONTINUOUS.md`, `PLAN.md`) lives in `graveyard/v2-cofounder-loop/` pending
deletion. Do not run it.

## gstack (Garry Tan's Engineering Skills)

gstack is installed at `.claude/skills/gstack`. Use `/browse` from gstack for all web browsing, never use mcp__claude-in-chrome__* tools. Available skills:

| Skill | When to use |
|-------|------------|
| `/office-hours` | Brainstorming a new idea, reframing a problem before code |
| `/plan-ceo-review` | Strategic review of a plan or feature idea |
| `/plan-eng-review` | Architecture review, data flow, edge cases, test plan |
| `/plan-design-review` | Design system audit, rates each dimension 0-10 |
| `/design-consultation` | Create a complete design system from scratch |
| `/review` | Code review before merge, find production bugs |
| `/investigate` | Systematic root-cause debugging |
| `/qa` | Test the app, find bugs, fix them, re-verify |
| `/qa-only` | Report-only QA, no code changes |
| `/design-review` | Visual QA, find and fix design issues with screenshots |
| `/ship` | Sync main, run tests, push, open PR |
| `/browse` | Headless browser: navigate, click, screenshot, verify |
| `/setup-browser-cookies` | Import real browser cookies for authenticated testing |
| `/document-release` | Update docs after shipping |
| `/retro` | Weekly retrospective with per-person stats |
| `/careful` | Safety mode: warns before destructive commands |
| `/freeze` | Restrict edits to a specific directory |
| `/guard` | Maximum safety: careful + freeze combined |
| `/unfreeze` | Remove edit restrictions |
| `/codex` | Adversarial second-opinion code review |
| `/gstack-upgrade` | Update gstack to latest version |
