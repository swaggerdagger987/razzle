# The Slice Contract

A **slice** is one vertical cut — API + UI + wiring — completable in one session, scoped to a stated file list, and gated before it counts. One slice per session. This is the unit of all product work.

## Why vertical

The prior repos died of horizontal sprawl: 76 ported pages, panels returning JSON scaffolds, process docs outnumbering features 3:1. A slice forces the opposite: one thing, all the way down (data → API → rendered surface → hallway wire), proven on localhost before the next thing starts.

Horizontal work (cross-cutting refactors, dependency bumps, polish passes) is legal only as an explicit card with a stated Trust-pillar justification (`spec/NORTH_STAR.md` T1–T7).

## Card format

Cards live in `factory/STATE.md` BACKLOG, in priority order. Cards exist in two states of detail:

- **Sketch** — goal, pillar, trust pillars, rough scope. Enough to prioritize, not enough to build.
- **Execution-ready** — a complete build sheet. **Only execution-ready cards may be claimed by an implementing session.** Frontier planning passes (`factory/ROUTING.md`) upgrade the top 1–2 sketches to execution-ready just-in-time; detailing the whole backlog up front is forbidden (specs rot).

An execution-ready card contains ALL of:

```markdown
### S-00X slug [OPEN — execution-ready]
- **Pillar/Layer / Trust:** as before.
- **Goal:** one sentence, outcome-shaped.
- **File plan:** every file, marked NEW or EDIT. EDITs state what changes
  ("main.py: one import + one include_router line"). This IS the scope fence.
- **Interfaces:** exact function signatures, endpoint paths with query params,
  request/response shapes. The implementer designs nothing at this altitude.
- **Data contract** (when data moves): source URLs, column names, the
  source→schema mapping table, type coercions, filters.
- **Test plan:** named test cases with the behavior each asserts, and fixtures.
- **Gates:** G1–G4 plus G5 as exact replayable commands with expected output.
- **Out of scope:** explicit list of adjacent things NOT to build.
- **Pitfalls:** known traps, verified against reference code where it exists.
```

The standard: **a competent implementer who has read only CLAUDE.md and this card can finish the slice without making a single product or architecture decision.** If the implementer hits a decision anyway, the card was defective — mark BLOCKED with the question (that is the escalation working, not a failure).

Status flow: `OPEN (sketch) → OPEN — execution-ready → ACTIVE → DONE` (or `BLOCKED`, or `KILLED`).

## Rules

- **Picking:** take the **topmost OPEN execution-ready** card. If none is execution-ready, that session becomes a frontier planning pass (detail the top sketches), not an improvisation session. If blocked, write the blocker on the card, mark BLOCKED, take the next.
- **Fence:** the Scope list is a commitment. Files outside it may be touched only with a one-line reason logged on the card.
- **No mid-session invention:** discovering work mid-slice does not change the slice. Write 1–3 proposed OPEN cards at the bottom of BACKLOG at session end instead.
- **Blocked means stop:** a card missing information that `spec/` can't answer gets the open question written on it, status BLOCKED. Guessing on spec-level questions is worse than stopping (`factory/ROUTING.md`).
- **Kill rule:** if north-star decision-framework steps 1–4 are all "no" and the card isn't infrastructure, mark KILLED with one line of why. Killing bad slices is a contribution.
- **Done means gated:** DONE requires G1–G4 green plus the card's G5 evidence in the commit body, and the hallway checklist (`spec/PRODUCT.md`) when the slice ships a user-facing surface.

## Sizing

A slice should be completable — implemented, gated, committed — in one working session. If a card can't plausibly fit, split it in BACKLOG before starting (a frontier-model planning task, per ROUTING). Err small: S-001 (one adapter, two tables, one endpoint) is the calibration reference.
