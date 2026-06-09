> [!CAUTION]
> **THIS BRANCH IS RETIRED — MIGRATED 2026-06-09.**
> Everything here was seeded to **`swaggerdagger987/razzle-hq` `main`**, which is the
> single source of truth. Do not commit, plan, or read state from this branch.
> The two post-migration spec commits (65983c6, 499515d) were reconciled into
> razzle-hq main (230319d, a6932b8). Go to razzle-hq.

# Razzle HQ

Razzle is a fantasy football film room disguised as a Sunday comic strip (razzle.lol). This repo is the product **and** the factory that builds it.

## Run

```bash
uv sync --all-packages && pnpm install     # one-time setup
scripts/dev.sh                             # API :8000 + web :3000
uv run pytest -q                           # all API tests
uv run ruff check && uv run ruff format --check
uv run alembic -c apps/api/alembic.ini upgrade head   # from repo root
pnpm --filter web build
```

## Reading order

1. `spec/NORTH_STAR.md` — what we're building and how work is scored (T1–T7).
2. `factory/STATE.md` — what's active, what's next, what's done.
3. The one slice you're doing (`factory/SLICE.md` for the contract).

Nothing else is required reading. Pull in other `spec/` files when your slice touches their territory (design → `spec/DESIGN.md`, copy → `spec/VOICE.md`, schema → `spec/DATA.md`).

## Hard rules

1. **Domain stays pure.** Nothing under `apps/api/src/razzle_api/domain/` imports database, network, cache, or HTTP code.
2. **Alembic owns the schema.** Every table change is a migration. No ad-hoc DDL.
3. **The old repos (`swaggerdagger987/razzle`, `swaggerdagger987/razzle-legacy`) are read-only reference quarries.** Read them for proven patterns; never import from them, never vendor their files, never recreate a `legacy_bridge`.
4. **No new top-level directories.** The layout is fixed; new code goes in existing homes.
5. **Spec budget:** adding a file to `spec/` or `factory/` requires deleting or merging one. Evidence goes in commit bodies, not new docs.
6. **One registry per catalog** (panels, staff, columns). Duplicates are a gate failure.
7. **Design tokens only:** every user-facing surface uses `packages/ui/tokens.css`. No raw hex in components.
8. **User-facing copy never says "AI"** (`spec/VOICE.md`).
9. Routers thin, services orchestrate, domain computes. No junk-drawer names (`utils/`, `helpers/`); single exception `core/`.

## Session protocol

1. `git status` must be clean. Read `factory/STATE.md`. Claim the topmost OPEN **execution-ready** slice (`factory/SLICE.md`): mark it ACTIVE, commit that one-line change (`S-00X: start`). If no card is execution-ready, this session's job is detailing the top sketches (frontier work per `factory/ROUTING.md`), not improvising.
2. Implement inside the slice's scope fence. Touching files outside it requires a one-line logged reason on the card.
3. Run gates G1–G4 plus the card's G5 (`factory/GATES.md`). Fix until green, or mark the card BLOCKED with the failing output and stop.
4. Update STATE.md (ACTIVE → DONE, append a LEDGER row), put gate evidence in the commit body, commit, push.
5. Optionally leave 1–3 newly discovered OPEN cards at the bottom of BACKLOG. Never start them.
6. **A dirty tree at session end is a failed session.**

Decisions not answerable from `spec/` are not yours to guess — see the escalation rule in `factory/ROUTING.md`.

## Git

- User `swaggerdagger987`, email `swaggerdagger987@users.noreply.github.com` — set both before committing.
- One commit per slice (plus the start-marker commit). Messages: short, descriptive, no emojis. Body carries gate evidence.
- Push after the slice commit. Never force-push.
