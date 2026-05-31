# Razzle V2 — Operational Status

**Last updated:** 2026-05-31 (factory cycle 119 — Launch-10 OG SAMPLE demo sticker)
**Branch context:** Active development on `razzle-v2-redesign`

This is the **live status summary**. For operating procedure, read
`docs/company/SOP.md` and `docs/company/AUTOMATION.md`. Retired phase history
lives in `graveyard/v2-cofounder-loop/PLAN.md`.

---

## Current loop state

From `LOOP-STATE.md`:

| Field | Value |
|-------|-------|
| Cycle | 119 |
| Last board | 54 |
| Focus pillar | Lab |
| Focus layer | L5 |
| Next slice | (epic complete — pick Lab L4 or Explore L2 from PARITY) |
| Last commit | `c892dd56` |

Recent completions (cycle 119): Launch-10 OG SAMPLE vs LIVE sticker; live-rows epic 3/3 complete.

---

## Factory / workday

| Field | Value |
|-------|-------|
| Workday | open (`good morning team`) |
| Epic | Lab L5 — OG live panel rows on Launch-10 (atom 2/3 shipped) |
| PR | #739 — prospects + weekly LIVE RPS/PPG stickers |

---

## Recent ship (cycle 118)

- Panel-specific LIVE sticker + blurb on `/og/prospects` and `/og/weekly` when live rows render.
- Preserves L4 dynasty-comps pro teaser rows on base (`teaserRowsForPanel`).
- Gate C: curl PNG ≥40KB on both routes.

---

## Blockers

- None for build. Merge API hit GitHub rate limit — PR #739 CI green, merge queued.
