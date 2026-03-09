# Razzle — Development Guide

## What Is This

Razzle is a fantasy football analytics platform at razzle.lol. A free Bloomberg terminal for fantasy football with a playful comic-strip aesthetic. Bengal tiger mascot named Razzle. Powered by nflverse + college stats. Monetized later through league-contextualized AI agents at $240/yr.

## Required Reading

Before writing ANY code, read these files in order:
1. `docs/ROADMAP.md` — Full phased plan with exit criteria. Follow it exactly.
2. `docs/DESIGN.md` — Theme, colors, typography, visual language. All UI must match.
3. `PROGRESS.md` — What's been completed. **Start from where this file left off.**

## Current Phase

Check `PROGRESS.md` to determine which phase you're in. Follow the roadmap phase-by-phase. **Do not skip phases. Do not start the next phase until the current phase's exit criterion is met.**

## Project Structure

```
razzle/
├── frontend/          # HTML, JS, CSS — no framework, browser-runnable
│   ├── index.html     # Landing page (home)
│   ├── lab.html       # The Lab (screener)
│   ├── league-intel.html
│   ├── agents.html    # War Room (later)
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
- NO dark mode (except War Room). NO gradients. NO thin 1px borders.
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
1. Read `PROGRESS.md` first. Continue from where it left off.
2. Follow the roadmap phase-by-phase. Do not skip.
3. Make your own decisions on implementation details — the roadmap and design guide have the constraints.
4. Update `PROGRESS.md` after completing each task.
5. Commit after each completed task.
6. If genuinely blocked (API down, missing critical info), document the blocker in PROGRESS.md and move to the next unblocked task.
7. Deploy to Render after completing each phase.
8. Reference the old FDL codebase at `C:\Users\mcgui\Documents\FDL` for proven patterns (especially live_data.py and nflverse sync logic) — but rewrite, don't copy.

## Reference Codebase

The old FDL project at `C:\Users\mcgui\Documents\FDL` has working implementations of:
- nflverse data sync (`live_data.py` — sync_nflverse_player_stats function)
- Sleeper API integration (`live_data.py` — fetch_sleeper_players_cached)
- Screener query logic (`live_data.py` — fetch_screener_query)
- Terminal server endpoints (`terminal_server.py`)

Use these as reference for proven patterns, but rewrite everything clean for the razzle repo. Every line should be intentional.
