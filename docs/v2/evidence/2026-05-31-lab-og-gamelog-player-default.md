# Evidence — lab-og-gamelog-player-default

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-player-default`  
**Verdict:** PASS (FACTORY-DOD Gate C2) — on base via PR #888 (`49b4f755`)

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test pytest apps/api/tests -q` — 59 passed, 5 skipped (includes `test_lab_og_export_link.py`)

## Gate C — OG PNG curl

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/gamelog?download=1&player_id=00-0036900` | 200 | 60634 | PASS |
| `/og/gamelog?download=1` (export default) | 200 | 60634 | PASS |

## Layer claim

Lab L5 — `LabOgExportLink` resolves `player_id=00-0036900` for gamelog/dynasty-comps when export omits query (`PLAYER_SCOPED_OG_SLUGS`).
