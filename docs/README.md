# Razzle Documentation Index

Start here before writing code or picking up loop work.

---

## Required reading (agents and humans)

Read in this order:

1. **`NORTH_STAR.md`** — Product endgame + **Trust Score (T1–T7)** for every agent cycle.
2. **`DESIGN.md`** — Colors, typography, voice, visual language.
3. **`DECISIONS.md`** — Locked V2 architecture calls.
4. **`v2/STATUS.md`** — Live operational status — current cycle, focus, blockers.
5. **`v2/PARITY.md`** — Vertical backlog — one slice per cycle.
6. **`v2/DEPTH.md`** — Depth strategy — what each layer means.
7. **`v2/ACCEPTANCE.md`** — Localhost finish-line gates.
8. **`company/STAGE.md`** — Where Razzle is right now (deep build, no users).
9. **`company/OPERATING_SYSTEM.md`** — How the company runs.

Also read **`../PRESERVE.md`** when touching legacy quarry code.

---

## Operational truth (changes frequently)

| Doc | Purpose |
|-----|---------|
| `v2/STATUS.md` | Live status |
| `v2/LOOP-STATE.md` | Cycle counter, focus pillar/layer, last commit |
| `v2/FEATURES.md` | Feature milestones (RED/YELLOW/GREEN) — depth tracked in `PARITY.md` |
| `v2/COUNCIL.md` | Ongoing build/role deliberation log |
| `v2/results.tsv` | Keep/discard/crash log per cycle |
| `v2/evidence/` | Per-slice screenshot and curl evidence |

---

## Company OS (canonical operating system)

| Doc | Purpose |
|-----|---------|
| `company/README.md` | Company docs index |
| `company/STAGE.md` | Current stage + advancement triggers |
| `company/OPERATING_SYSTEM.md` | Principles, ethos, reconciliation |
| `company/ORG_CHART.md` | Six-role build company + future hires |
| `company/MEETINGS.md` | Daily standup, build review, founder board |
| `company/AUTOMATION.md` | Standard company loop, model routing, never-automate rules |
| `company/SCORECARDS.md` | 3-line daily / full-grid monthly evaluation |
| `company/HIRING_AND_FIRING.md` | Role lifecycle |
| `company/SOP.md` | CEO-mode operating procedure and old-loop ethos preserved |
| `company/GUARDRAILS.md` | Branch protection, run lock, prompt-sync, and founder-only boundaries |
| `company/NEXT.md` | Current lead slice + backup candidate for first Slack cycles |
| `company/SLACK.md` | Operator cheat sheet for Slack-triggered runs (phone-friendly) |
| `company/roles/<role>.md` | Per-role contracts |
| `company/memory/<role>.md` | Per-role learning logs |
| `company/standups/YYYY-MM-DD.md` | Daily build standup outputs |
| `company/automations/<name>.md` | Cursor Automation prompt specs (good-morning, ask-team, good-evening, tick) |
| `company/state/workday.json` | Workday semaphore (open/closed) shared across automations |

Cursor Cloud Agents read `../AGENTS.md` (root) on boot, which routes them into `company/automations/`.

Company docs serve product docs. The North Star still wins.

---

## Product depth (reference)

| Doc | Purpose |
|-----|---------|
| `ROADMAP.md` | Original phased plan |
| `v2/DEPTH.md` | Vertical depth strategy |
| `v2/HALLWAY.md` | Connective tissue checklist |
| `v2/AGENTS.md` | Six-agent wiring map (in-product agents) |
| `v2/VOICE.md` | Marketing voice (Reddit-first, not "AI-first") |
| `v2/REDDIT.md` | GTM channel constraints |
| `v2/REDDIT-INTEL.md` | Outside reality log (build-input) |
| `v2/IA.md` | Information architecture |
| `v2/PRODUCT.md` | Product surface summary |
| `v2/INTEL.md` | Context snippets layer |
| `v2/TICKETS.md` | Reference ticket backlog (active backlog is `PARITY.md`) |
| `v2/SECRETS.md` | Env keys (do not commit) |

---

## Plans (design specs)

| Doc | Topic |
|-----|-------|
| `plans/2026-05-27-repo-organization-cleanup.md` | Repo hygiene plan (executed; later phases superseded by graveyard) |
| `plans/2026-03-20-agent-connective-tissue-design.md` | Agent hallway design |
| `plans/2026-03-14-mascot-system-design.md` | Mascot system |
| `plans/2026-03-14-monte-carlo-league-odds-design.md` | Monte Carlo design |

---

## Two AI systems — do not confuse

- **`company/roles/`** — AI staff that **builds** Razzle. Read these when invoking a build-loop role.
- **`../agent-personas/`** — AI staff that ships **inside** Razzle to users (Razzle, Dolphin, Hawkeye, Fox, Octopus, Elephant). Wired through `packages/agents/` and `apps/api/services/agents/`.

Same word "agent." Different jobs. Both systems coexist permanently.

---

## Legacy quarry

| Doc | Purpose |
|-----|---------|
| `../legacy/README.md` | Boundary contract — read-only quarry |
| `../PRESERVE.md` | What survived V1-to-V2 migration |

V2 code may import legacy only through `apps/api/legacy_bridge.py`.

---

## Graveyard (do not read for current truth)

`../graveyard/` holds systems Razzle no longer runs:

- `v2-cofounder-loop/` — deprecated three-equals cofounder loop (PROGRAM, COFOUNDERS, BOARD, LOOP, START-LOOP, CONTINUOUS, PLAN, `loop-prompt-*.txt`, `v2_loop.sh`)
- `process/` — V1 autonomous process artifacts
- `reviews/` — March 2026 audits
- `marketing/` — premature GTM docs (reactivate at LAUNCH-READY)
- `designs/` — old surface design memos
- `top-level/` — stale root-level docs (PROGRESS_ARCHIVE, CAMPAIGN_PLAN, BRAND_VOICE_REVIEW)

See `../graveyard/README.md` for deletion rules.

---

## Hygiene debt (documented, not fixed yet)

- **`.claude/skills/gstack`** — Large vendored skill tree tracked in git. Future: submodule or global install.
- **Duplicate panel registry** — `@razzle/panels` is canonical; `apps/web/lib/panels/registry.ts` may duplicate. Consolidate in a separate code PR.

---

## Secrets

**Do not commit or paste secrets.** Runtime keys live in env vars. Operational notes (if any) stay in `v2/SECRETS.md` — agents should not edit that file during hygiene tasks.
