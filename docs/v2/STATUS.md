# Razzle V2 — Operational Status

**Last updated:** 2026-05-31 (factory cycle 120 — Launch-10 OG SAMPLE vs LIVE stickers)  
**Branch context:** Active development on `razzle-v2-redesign`

This is the **live status summary**. For operating procedure, read
`docs/company/SOP.md` and `docs/company/AUTOMATION.md`. Retired phase history
lives in `graveyard/v2-cofounder-loop/PLAN.md`.

---

## Current loop state

From `LOOP-STATE.md`:

| Field | Value |
|-------|-------|
| Cycle | 120 |
| Last board | 54 |
| Focus pillar | Lab |
| Focus layer | L5 |
| Next slice | PARITY next Lab L5 row |
| Last commit | `59f124d4` |

---

## Factory / workday

| Field | Value |
|-------|-------|
| Workday | open (`good morning team`) |
| Epic | Lab L5 — OG live panel rows on Launch-10 (**complete** atom 3/3) |
| PR | pending publish — SAMPLE vs LIVE stickers |

---

## Recent ship (cycle 118)

- Panel-specific LIVE sticker + blurb on `/og/prospects` and `/og/weekly` when live rows render.
- Preserves L4 dynasty-comps pro teaser rows on base (`teaserRowsForPanel`).
- Gate C: curl PNG ≥40KB on both routes.

---

## Blockers

- None for build. Merge API hit GitHub rate limit — PR #739 CI green, merge queued.
