# Razzle V2 — Operational Status

**Last updated:** 2026-05-27 (repo organization cleanup)  
**Branch context:** Active development on `razzle-v2-redesign`

This is the **live status summary**. For operating procedure, read
`docs/company/SOP.md` and `docs/company/AUTOMATION.md`. Retired phase history
lives in `graveyard/v2-cofounder-loop/PLAN.md`.

---

## Current loop state

From `LOOP-STATE.md`:

| Field | Value |
|-------|-------|
| Cycle | 85 |
| Last board | 54 |
| Focus pillar | League |
| Focus layer | L5 |
| Next slice | Lab OG live rows (see NEXT.md) |
| Last commit | `a543f3f0` |

Recent completions (cycle 56): Explore L5 watermarked export, Lab L5 OG export fix.

---

## Product surface summary

| Area | State | Notes |
|------|-------|-------|
| Explore (screener) | Shipping | NFL + college, URL state, Player Sheet, OG export |
| Lab (panels) | Shipping | Launch 10 at L1+; depth work continues per PARITY |
| Bureau (league) | Shipping | Self-Scout default; 8 features wired; some heuristics remain |
| Situation Room | Partial | Chat + orchestration live; pixel canvas shipped (see FEATURES F-06) |
| Auth / billing | Scaffold | Legacy bridge; Pro yearly on launch per DECISIONS |
| Data pipeline | OK | `terminal.db` via nflverse adapters; sync scripts in `scripts/` |

---

## Feature milestones (quick view)

See **`FEATURES.md`** for full table. One item still YELLOW:

- **F-06 Pixel Situation Room** — Chat + briefing live; verify canvas visibility against acceptance gates

All other F-01 through F-14 milestones are GREEN (milestone != infinite depth; see PARITY).

---

## Vertical position

Per **`PARITY.md`**: ~15% of V1 depth, ~5% of ceiling ambition. All four pillars (Explore, Lab, League, Room) at L4-L5. Council picks **one vertical slice per cycle** — no horizontal porting of 76 legacy HTML pages.

Launch 10 lab panels: all GREEN at L1 with L3 formula re-sort.

---

## Known scaffold / bridge debt

These are intentional; each is a bounded file marked in code:

- `apps/api/services/*` proxying `legacy/backend/live_data/` via `legacy_bridge.py`
- Bureau helpers using heuristics where V2-native joins are not written yet
- `apps/web/lib/panels/registry.ts` may duplicate `@razzle/panels` catalog (consolidation planned)

**Do not delete `legacy/` until bridge imports reach zero.** Checklist: `legacy/README.md`.

---

## Acceptance gates

Local finish line: **`ACCEPTANCE.md`**. Loop evidence goes to `docs/v2/evidence/`.

Quick health check:

```bash
JWT_SECRET=test pytest apps/api/tests -q
npm run build
curl localhost:8000/api/health
```

---

## What to read next

| If you are... | Read |
|---------------|------|
| Picking up loop work | PARITY.md, DEPTH.md, FEATURES.md, LOOP-STATE.md, `docs/company/SOP.md`, `docs/company/AUTOMATION.md` |
| Making architecture calls | DECISIONS.md (write dated entry before reversing) |
| Checking product intent | NORTH_STAR.md, DESIGN.md |
| Understanding what was built | `docs/v2/results.tsv`, `docs/v2/evidence/`, and retired history in `graveyard/v2-cofounder-loop/PLAN.md` |
| Repo hygiene | docs/plans/2026-05-27-repo-organization-cleanup.md |

---

## Blockers

None documented at status refresh. If blocked on secrets or external APIs, note here and in COUNCIL.md — do not stall the loop waiting for human input on routine slices.
