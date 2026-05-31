# Razzle V2 — Operational Status

**Last updated:** 2026-05-31 (factory cycle 124 — Explore OG LIVE/SAMPLE stickers)  
**Branch context:** Active development on `razzle-v2-redesign`

This is the **live status summary**. For operating procedure, read
`docs/company/SOP.md` and `docs/company/AUTOMATION.md`. Retired phase history
lives in `graveyard/v2-cofounder-loop/PLAN.md`.

---

## Current loop state

From `LOOP-STATE.md`:

| Field | Value |
|-------|-------|
| Cycle | 124 |
| Last board | 54 |
| Focus pillar | Explore |
| Focus layer | L5 |
| Next slice | explore-og-college-demo-rows |
| Last commit | `da33eafd` |

---

## Factory / workday

| Field | Value |
|-------|-------|
| Workday | open (`good morning team`, cycle 2) |
| Epic | Explore L5 — screener OG LIVE/SAMPLE honesty (atom 1/3) |
| PR | autopen after push |

---

## Recent ship (cycle 118)

- Panel-specific LIVE sticker + blurb on `/og/prospects` and `/og/weekly` when live rows render.
- Preserves L4 dynasty-comps pro teaser rows on base (`teaserRowsForPanel`).
- Gate C: curl PNG ≥40KB on both routes.

---

## Blockers

- None for build. Merge API hit GitHub rate limit — PR #739 CI green, merge queued.
