# Razzle V2 — Preservation Manifest

This file lists every artifact from the legacy codebase that must survive the V2 redesign. Everything else in the repo at the start of Phase 2 is fair game for deletion.

If you find yourself reaching for something not listed here and it does not appear in the new tree, check `git log master -- <path>` to recover it.

---

## Product canon (do not edit)

| Path | Why it survives |
|---|---|
| `docs/NORTH_STAR.md` | The endgame. Every V2 decision filters through this. |
| `docs/DESIGN.md` | Color, typography, voice, visual language. The brand IS the moat. |
| `docs/ROADMAP.md` | Phased execution plan; V2 fulfills Phase 2 directly. |
| `graveyard/top-level/PROGRESS_ARCHIVE.md` | Historical record of build phases (graveyard). |
| `graveyard/top-level/BRAND_VOICE_REVIEW.md` | Voice calibration (graveyard). |
| `graveyard/top-level/CAMPAIGN_PLAN.md` | GTM context (graveyard, pre-launch). |
| `graveyard/designs/bureau-design.md`, `graveyard/designs/launch-design.md` | Surface-specific design notes (graveyard). |
| `agent-personas/*.md` | Six AI agent system-prompt scaffolding. Wired into `apps/api/services/agents/`. |

## Data layer (lift and shift)

| Path | New home in V2 |
|---|---|
| `data/terminal.db` | `data/terminal.db` (unchanged path; gitignored) |
| `data/terminal_clean.db` | `data/terminal_clean.db` (recovery backup) |
| `adapters/nflverse_adapter.py` | `apps/api/adapters/nflverse.py` |
| `adapters/cfbfastr_adapter.py` | `apps/api/adapters/cfbfastr.py` |
| `adapters/college_adapter.py` | `apps/api/adapters/college.py` |
| `adapters/utils.py` | `apps/api/adapters/utils.py` |
| `backend/db.py` (schema + pool concept only) | `apps/api/db.py` (simplified) |
| `backend/live_data/players.py` | `apps/api/services/players.py` |
| `backend/live_data/dynasty.py` | `apps/api/services/dynasty.py` |
| `backend/live_data/analytics.py` | `apps/api/services/analytics.py` |
| `backend/live_data/dashboards.py` | `apps/api/services/dashboards.py` |
| `backend/live_data/prospects.py` | `apps/api/services/prospects.py` |
| `backend/live_data/college.py` | `apps/api/services/college.py` |
| `backend/live_data/tools.py` | `apps/api/services/tools.py` |
| `backend/live_data/storage.py` | `apps/api/services/storage.py` |
| `backend/live_data/core.py` | `apps/api/services/core.py` (cache helpers trimmed) |
| `backend/agent_facts.py` | `apps/api/services/agent_facts.py` |

## Design assets

| Path | New home in V2 |
|---|---|
| `frontend/assets/agents/*.svg` | `apps/web/public/agents/` (six SVGs) |
| `frontend/assets/og-image.png`, `og-image-lab.png` | `apps/web/public/og/` (replaced by generated cards over time) |
| `frontend/favicon.png`, `favicon.svg` | `apps/web/public/` |
| `frontend/manifest.json` | `apps/web/public/manifest.webmanifest` |
| `frontend/styles.css` (CSS variable tokens only — `:root` + `[data-theme="dark"]` blocks) | `packages/ui/tokens.css` |

## Deployment scaffolding

| Path | New home in V2 |
|---|---|
| `render.yaml` (concept) | `infra/render.yaml` (port choice TBD by dev team) |
| `requirements.txt` (pruned) | `apps/api/requirements.txt` |
| `.env.example` (pruned) | `apps/api/.env.example` |
| `.gitignore` | merged into root `.gitignore` |

---

## Explicitly NOT preserved

Anything below is being removed in Phase 2. If something here turns out to be load-bearing for V2, recover from `git log master`.

- All 76 standalone HTML pages under `frontend/*.html` (replaced by `apps/web` SPA routes)
- All JS under `frontend/*.js` (replaced by typed components in `apps/web`)
- All non-token CSS under `frontend/*.css` (replaced by design-system primitives in `packages/ui`)
- `frontend/pokemon-lab/` (five Situation Room prototypes — v5 hybrid pattern carries forward as inspiration only)
- All process artifact directories: `tickets/`, `audit-fix/`, `designer-tickets/`, `functional-qa/`, `twitter/`, `data/reddit/`
- All `run-*-loop.ps1`, all `*-prompt.txt`, `designer-state.json`
- All large tracking markdown files at repo root (`PROGRESS.md`, `TICKETS.md`, `DEEP-AUDIT-TICKETS.md`, `STAT-AUDIT-REPORT.md`)
- All hand-rolled infra inside `backend/server.py` (request cache, enriched cache, rate-limit table, connection pool internals, env validator, subscription reconciliation loop)
- `backend/auth.py` (1,305 lines) and `backend/billing.py` (903 lines) — replaced by managed auth provider + Stripe Customer Portal in Phase 3
- `scripts/build_dist.py` (replaced by framework bundler)
- All `tests/test_*.py` smoke tests (replaced by new test suite in Phase 4+)
