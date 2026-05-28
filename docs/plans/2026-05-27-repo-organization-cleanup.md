# Repo Organization Cleanup Plan

**Date:** 2026-05-27  
**Status:** Executed 2026-05-27. Phases 1–3 of the original plan are now superseded by the `graveyard/` cleanup. Remaining hygiene debt (gstack vendor, panel registry consolidation) tracked in `docs/README.md` "Hygiene debt."  
**Owner:** Historical reference

> **Banner — read first:** This plan describes the **before-state** of the repo as of 2026-05-27 morning. Many paths it lists (e.g. `docs/process/`, `docs/v2/PROGRAM.md`, `loop-prompt-*.txt`) no longer exist at those locations — they have been moved into `graveyard/`. The Company OS (`docs/company/`) has replaced the cofounder loop described below. Do not use this file to navigate current truth; read `docs/README.md` instead.

This plan separates three coexisting realities in the Razzle repo, defines the target shape, and phases cleanup work without breaking the V2 loop or legacy bridge.

---

## Diagnosis — three realities

### 1. V2 monorepo (canonical product)

Active code lives under `apps/`, `packages/`, `infra/`, and `data/`. FastAPI + Next.js + shared packages. This is what ships to razzle.lol.

### 2. Legacy quarry (intentional pitstop)

`legacy/` holds V1 frontend/backend staged during the strangler-fig migration. V2 reaches it only through `apps/api/legacy_bridge.py`. It is read-only quarry material, not dead code to delete casually.

### 3. Agent / process / tooling sprawl

Multiple overlapping doc systems accumulated during V2 build:

- Root `CLAUDE.md` still described V1 vanilla HTML structure and missing `PROGRESS.md`
- `docs/v2/PLAN.md` mixes post-implementation history with operational status
- `docs/process/` holds V1 loop artifacts (LOOP-TASKS, designer tickets, etc.)
- Root `loop-prompt-*.txt` files are wired into `scripts/v2_loop.sh`
- `.claude/skills/gstack` is tracked in git and very large (hygiene debt, not a delete target yet)
- Duplicate panel registries: `@razzle/panels` (canonical) vs `apps/web/lib/panels/registry.ts` (web-local)

The repo works, but agents and humans lack a single "start here" map.

---

## Target repo shape

```
razzle/
  apps/
    api/              FastAPI — routers, services, adapters, migrations
    web/              Next.js 15 — app routes, components, lib
  packages/
    ui/               design tokens + primitives
    types/            shared Zod/TS types
    panels/           canonical panel catalog + handlers
    agents/           agent registry
    hallway/          connective tissue helpers
    pixel-room/       Situation Room canvas
  data/               terminal.db, users.db (gitignored)
  docs/               product + V2 ops docs (see docs/README.md)
  agent-personas/     LLM system prompts (six agents)
  infra/              Dockerfile, fly.toml, render.yaml
  legacy/             V1 quarry — read-only via legacy_bridge
  scripts/            data sync, v2_loop.sh, one-offs
  loop-prompt-*.txt   loop prompts (root for now — see Phase 2)
  .claude/skills/     agent tooling (gstack vendored — see Phase 2)
```

**Not in target shape (archive or delete later):**

- `docs/process/` — V1 autonomous loop artifacts
- Stale root tracking files if any reappear (`PROGRESS.md`, `TICKETS.md`, etc.)
- Direct imports from `legacy/` outside `legacy_bridge.py`

---

## Source-of-truth docs map

| Doc | Role | Update when |
|-----|------|-------------|
| `docs/NORTH_STAR.md` | Product endgame | Strategy shifts |
| `docs/DESIGN.md` | Visual language + voice | Brand/UI changes |
| `docs/DECISIONS.md` | Locked architecture calls | New irreversible choices |
| `docs/v2/STATUS.md` | **Live operational status** | Each loop cycle or milestone |
| `docs/v2/PARITY.md` | Vertical backlog (what to build next) | Council picks slices |
| `docs/v2/ACCEPTANCE.md` | Localhost finish-line gates | Gate criteria change |
| `docs/v2/PLAN.md` | Post-implementation companion | Major phase completes |
| `PRESERVE.md` | V1-to-V2 preservation manifest | Legacy quarry changes |
| `legacy/README.md` | Legacy boundary contract | Bridge imports change |
| `docs/README.md` | Docs index (active vs archive) | Doc moves or retires |

**Loop-specific (operational, not product canon):**

| Doc | Role |
|-----|------|
| `docs/v2/LOOP-STATE.md` | Current cycle counter + focus |
| `docs/v2/FEATURES.md` | Feature milestone RED/YELLOW/GREEN |
| `docs/v2/COUNCIL.md` | Cofounder + board meeting log |
| `docs/v2/PROGRAM.md` | Loop program instructions |
| `docs/v2/evidence/` | Screenshot/curl evidence per slice |

---

## Phase 1 — Docs reset (this task)

**Goal:** One clear reading order; no stale V1 assumptions in agent entry points.

- [x] Create `docs/README.md` — active vs archive map
- [x] Create `docs/v2/STATUS.md` — concise live status (points to PLAN.md for history)
- [x] Create `legacy/README.md` — quarry boundary + deletion checklist
- [x] Update root `CLAUDE.md` — V2 structure, reading order, remove PROGRESS.md
- [x] Update root `README.md` reading order — add STATUS + docs index
- [x] Create this plan at `docs/plans/2026-05-27-repo-organization-cleanup.md`

**Verification:**

```bash
grep -r "PROGRESS.md" CLAUDE.md README.md docs/README.md   # should not mandate missing file
test -f docs/v2/STATUS.md && test -f legacy/README.md
```

---

## Phase 2 — Tooling / vendor cleanup (later only)

**Do not execute in Phase 1.** Document and schedule separately.

### `.claude/skills/gstack`

- **Problem:** Large vendored skill tree tracked in git; bloats clone size and diffs
- **Options:**
  1. Git submodule pointing to upstream gstack repo
  2. Document install via `~/.claude/skills/gstack` + remove from repo (add to `.gitignore`)
  3. Sparse checkout / optional install script
- **Constraint:** Many agents reference `.claude/skills/gstack` in CLAUDE.md and workspace rules
- **Migration steps (future):**
  1. Add `scripts/install-gstack.sh` or document global install in README
  2. Update CLAUDE.md path references
  3. Remove tracked copy in a dedicated PR with team awareness
  4. Verify `/browse` and other skills still resolve

### Root `loop-prompt-*.txt`

- **Problem:** Prompt files at repo root feel messy
- **Constraint:** `scripts/v2_loop.sh` hardcodes:
  - `$ROOT/loop-prompt-v2.txt`
  - `$ROOT/loop-prompt-continuous.txt`
  - `$ROOT/loop-prompt-board.txt`
- **Future relocation:** Move to `docs/v2/prompts/` and update `v2_loop.sh` paths in same PR
- **Until then:** Document why they stay at root (script contract)

### Other tooling hygiene (future)

- Audit `docs/v2/` for duplicate status sources; keep STATUS.md as live, PLAN.md as historical
- Consider collapsing `docs/process/` into `docs/archive/process/` with a pointer in docs/README.md

---

## Phase 3 — Archive stale process docs (later)

**Target:** `docs/process/` and root-level V1 loop artifacts.

| Path | Action |
|------|--------|
| `docs/process/LOOP-TASKS.md` | Archive — superseded by `docs/v2/LOOP-STATE.md` + FEATURES |
| `docs/process/PLATFORM-LOOP-TASKS.md` | Archive |
| `docs/process/DESIGN-TICKETS.md` | Archive |
| `docs/process/BUGFIX-TRACKER.md` | Archive or merge open items into `docs/v2/TICKETS.md` |
| `docs/process/UX-LOOP-TASKS.md` | Archive |

**Steps:**

1. Create `docs/archive/process/` (or `docs/archive/v1-loop/`)
2. Move files; add redirect stubs at old paths for one release cycle OR update all grep references first
3. Update `docs/README.md` archive section
4. Do not delete evidence in `docs/v2/evidence/`

---

## Phase 4 — Legacy bridge retirement checklist

Execute only when V2 services no longer import legacy modules.

**Preconditions:**

- [ ] `grep -r "legacy_bridge" apps/api` shows only intentional shims OR zero imports
- [ ] All `apps/api/services/*.py` that proxy via `live_data()` have V2-native SQL
- [ ] Auth/billing either ported or on managed providers per DECISIONS.md
- [ ] `pytest apps/api/tests` passes without legacy on path
- [ ] Acceptance gates in `docs/v2/ACCEPTANCE.md` all green

**Deletion sequence:**

1. Remove callers of `legacy_bridge.live_data()`, `.auth()`, `.billing()`, `.agent_facts()`
2. Delete `apps/api/legacy_bridge.py`
3. Delete `legacy/` tree (after final git tag: `legacy-quarry-final`)
4. Update `PRESERVE.md`, `docs/v2/PLAN.md`, `legacy/README.md` → note retirement date
5. Remove `sys.path` injection tests if any

**Approved bridge dependencies today** (only via `legacy_bridge.py`):

- `backend.live_data` — screener/dynasty/analytics queries
- `backend.auth` — JWT + bcrypt
- `backend.billing` — Stripe webhooks + plan state
- `backend.agent_facts` — agent context assembly

---

## Phase 5 — Code registry consolidation checklist

**Problem:** Panel metadata may exist in two places:

| Location | Status |
|----------|--------|
| `packages/panels/` (`catalog.json`, `catalog.ts`, `handlers.ts`) | **Canonical** |
| `apps/web/lib/panels/registry.ts` | Web-local; may duplicate catalog |

**Future work (separate PR, not Phase 1):**

1. Audit imports: `grep -r "lib/panels/registry" apps/web`
2. Migrate web routes to import from `@razzle/panels` only
3. Keep `apps/web/lib/panels/modules/` as React renderers if needed, but slugs/metadata from package
4. Mirror pattern on API: `apps/api/services/panels/dispatcher.py` should read same catalog source
5. Delete `apps/web/lib/panels/registry.ts` when zero references remain
6. Add test: catalog slug count matches `/lab` index

Similarly watch for duplicate agent registries (`packages/agents` vs `apps/api/services/agents/registry.py` — intentional mirror per AGENTS.md; document, do not merge blindly).

---

## Safety rules

1. **Never delete `legacy/` or product code in hygiene-only tasks**
2. **Never move `loop-prompt-*.txt` without updating `scripts/v2_loop.sh` in the same PR**
3. **Never delete `.claude/skills/gstack` without migration plan and team sign-off**
4. **Never revert unrelated dirty git changes** — work alongside them
5. **Do not touch `docs/v2/SECRETS.md` or `.env` files**
6. **Do not commit secrets or production credentials**

---

## Verification commands

```bash
# Stack health
cd apps/api && pip install -r requirements-dev.txt -q
JWT_SECRET=test pytest apps/api/tests -q
cd apps/web && npm run build

# Doc consistency
rg "PROGRESS\.md" CLAUDE.md README.md docs/README.md
rg "frontend/lab\.html" CLAUDE.md README.md          # should be gone from entry docs
test -f docs/v2/STATUS.md
test -f legacy/README.md

# Legacy boundary
rg "sys\.path" apps/api --glob '!legacy_bridge.py'   # should find nothing outside bridge

# Loop script still finds prompts
test -f loop-prompt-v2.txt && test -f loop-prompt-continuous.txt && test -f loop-prompt-board.txt
```

---

## Explicit non-goals

- Deleting or moving `legacy/`
- Removing `.claude/skills/gstack` from the repo
- Relocating root loop prompt files (Phase 2)
- Consolidating panel registries in code (Phase 5)
- Rewriting `docs/NORTH_STAR.md`, `DESIGN.md`, or `DECISIONS.md`
- Running full E2E or deploy
- Git commit or push as part of hygiene doc tasks

---

## Follow-up PR suggestions

1. **docs-only (done in Phase 1):** This plan + STATUS + CLAUDE.md refresh
2. **archive-process:** Move `docs/process/` to archive with index update
3. **prompt-relocate:** `docs/v2/prompts/` + `v2_loop.sh` path update
4. **gstack-unvendor:** Submodule or global-install migration
5. **panels-dedupe:** Single `@razzle/panels` source of truth
6. **legacy-retire:** When bridge imports hit zero
