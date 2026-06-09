# The Slice Contract

A **slice** is one vertical cut — API + UI + wiring — completable in one session, scoped to a stated file list, and gated before it counts. One slice per session. This is the unit of all product work.

## Why vertical

The prior repos died of horizontal sprawl: 76 ported pages, panels returning JSON scaffolds, process docs outnumbering features 3:1. A slice forces the opposite: one thing, all the way down (data → API → rendered surface → hallway wire), proven on localhost before the next thing starts.

Horizontal work (cross-cutting refactors, dependency bumps, polish passes) is legal only as an explicit card with a stated Trust-pillar justification (`spec/NORTH_STAR.md` T1–T7).

## Card format

Cards live in `factory/STATE.md` BACKLOG, in priority order:

```markdown
### S-004 explore-custom-scoring [OPEN]
- **Pillar/Layer:** Explore L3 · **Trust:** T1, T3
- **Goal:** one sentence.
- **Scope:** expected files/dirs — the fence.
- **Gates:** G1–G4 always; G5 = slice-specific assertions
  (e.g. "curl /api/screener?preset=ppr returns points column",
  "URL state survives refresh").
- **Evidence:** the commands + outputs the commit body must show.
```

Status flow: `OPEN → ACTIVE → DONE` (or `BLOCKED`, or `KILLED`).

## Rules

- **Picking:** take the **topmost OPEN** card. If blocked, write the blocker on the card, mark BLOCKED, take the next. Never cherry-pick downlist because something looks more fun.
- **Fence:** the Scope list is a commitment. Files outside it may be touched only with a one-line reason logged on the card.
- **No mid-session invention:** discovering work mid-slice does not change the slice. Write 1–3 proposed OPEN cards at the bottom of BACKLOG at session end instead.
- **Blocked means stop:** a card missing information that `spec/` can't answer gets the open question written on it, status BLOCKED. Guessing on spec-level questions is worse than stopping (`factory/ROUTING.md`).
- **Kill rule:** if north-star decision-framework steps 1–4 are all "no" and the card isn't infrastructure, mark KILLED with one line of why. Killing bad slices is a contribution.
- **Done means gated:** DONE requires G1–G4 green plus the card's G5 evidence in the commit body, and the hallway checklist (`spec/PRODUCT.md`) when the slice ships a user-facing surface.

## Sizing

A slice should be completable — implemented, gated, committed — in one working session. If a card can't plausibly fit, split it in BACKLOG before starting (a frontier-model planning task, per ROUTING). Err small: S-001 (one adapter, two tables, one endpoint) is the calibration reference.
