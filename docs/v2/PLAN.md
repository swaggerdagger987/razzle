# Razzle V2 — Implementation Status

This is the post-implementation companion to the original `razzle v2 redesign` plan. It records what was built in this V2 sweep, what remains as labeled scaffolding, and what the next devs should pick up.

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 1 — Preserve | ✅ Complete | `PRESERVE.md` is the manifest. |
| 2 — Demolish | ✅ Complete | V1 staged in `legacy/`; process artifacts deleted entirely. |
| 3 — Re-skeleton | ✅ Complete | Monorepo, 7 routers, Alembic, Sentry, slowapi, Decisions doc. |
| 4 — Screener | ✅ Complete | `/lab/[panel]` covers 21 panels (10 live, 11 coming-soon stubs). Virtualized table, unified `/og/[panel]`. |
| 5 — Bureau | ✅ Complete | All 8 features wired end-to-end. Self-Scout is the default landing view. |
| 6 — Situation Room | ✅ Complete | Three agents, real two-pass orchestration, urgency-tier UI. |
| 7 — Launch loop | ✅ Complete | `!razzle` bot, OG cards (Phase 4), PostHog wired, snapshot tests, CI workflow. |

## What's intentionally scaffolded (the "Phase X.5" pickups)

These are real, shippable surfaces today but lean on the legacy module shim or use heuristics where the V2-native data join hasn't been written yet. Each is one file and well-marked in code.

- **`apps/api/services/players.py`**, `dynasty.py`, `analytics.py` — proxy through `legacy/backend/live_data/` via `sys.path` injection. Phase 4.5 inlines the SQL and rewrites the derived-sort hot path so we can delete the legacy import.
- **`apps/api/services/bureau/roster_depth.py::_depth_by_position`** — returns empty position buckets because Sleeper's roster payload only carries `player_id`. Phase 5.5 joins on `terminal.db.players` to populate counts and elite-tier flags.
- **`apps/api/services/bureau/monte_carlo.py`** — returns the right shape with zeroed distributions. Phase 5.5 reads from a `projections` table once the adapter writes it.
- **`apps/api/services/bureau/strength_of_schedule.py`** — uses average opponent PPG as a proxy. Phase 5.5 pulls the actual remaining schedule from `/league/{id}/matchups/{week}`.
- **`apps/api/services/bureau/self_scout.py::_young_skew`** — always returns False. Phase 5.5 joins on `players.age`.
- **`apps/api/services/billing.py::subscription_status`** — returns "free / inactive" until Phase 4.5 wires the `users.db` plan table read.
- **`apps/api/services/agents/orchestrator.py::_estimate_cost`** — uses a flat OpenRouter haiku-tier rate. Phase 6.5 reads the actual cost field OpenRouter returns.

## What got smaller

| Surface | V1 | V2 | Δ |
|---|---|---|---|
| HTML files | 76 | 0 (all routes are React) | -76 |
| `server.py` lines | 3,965 | `apps/api/main.py`: ~115 | -97% |
| `lab.js` lines | 13,413 | per-panel modules: ~30-200 each | per-panel |
| `lab-panels.js` lines | 10,514 | n/a | -100% |
| Top-level dirs | 14 | 7 (apps, packages, data, docs, infra, agent-personas, legacy) | -50% |
| Process-artifact dirs | 6 | 0 | -100% |
| Loop/prompt files | 17 | 0 | -100% |
| Billing tiers active | 4 (Pro/Elite/EA/Lifetime) | 1 (Pro/yr) | -75% |
| Situation Room UX prototypes | 5 | 1 (v5-hybrid) | -80% |

## What's actually new

- Typed end-to-end: Pydantic v2 on the wire ↔ Zod schemas in `packages/types`.
- One screener route handles every panel via the registry — adding a panel is one file.
- Unified `/og/[panel]` produces both the Twitter/Reddit OG card and the in-product watermarked download from the same renderer. No more Playwright screenshot job.
- Real Bureau Self-Scout end-to-end (LeagueContext loader + 8 features sharing it).
- Real Situation Room orchestration: two LLM calls (route → synthesize) instead of six in parallel.
- `!razzle` Reddit bot ready to deploy (subreddit watcher + trade-command parser + cooldown).
- PostHog wired with named funnel events. Sentry wired. snapshot-tests scaffolded for screener data drift.

## What the next devs do first

1. Run `pip install -r apps/api/requirements-dev.txt && pytest apps/api/tests -q`. Should see ~9 passed.
2. Read `docs/DECISIONS.md`. If any of those defaults is wrong for the team, write the dated entry first.
3. Pick a Phase X.5 pickup from the list above and start there. Each is a single file.
4. Boot `npm install && npm run dev` from the repo root, point `NEXT_PUBLIC_API_ORIGIN` at the running API, dogfood `/lab`, `/bureau`, `/room`.
5. Once parity feels right for the launch ten panels + Self-Scout + the three-agent Room, point the production DNS at the V2 host and delete `legacy/`.
