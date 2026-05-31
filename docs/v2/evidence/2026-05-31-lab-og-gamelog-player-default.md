# Evidence — lab-og-gamelog-player-default

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-player-default`  
**Verdict:** PASS (FACTORY-DOD Gate C2)

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 61 passed, 5 skipped

## Gate C — OG PNG curl

Re-verified 2026-05-31T14:05Z on `cursor/workday-cycle-initiation-5907` after base sync.

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/gamelog?download=1&player_id=00-0036900` | 200 | 60634 | PASS |
| `/og/gamelog?download=1` (LabOgExportLink default) | 200 | 60634 | PASS |

Both PNGs: 1200×630, ≥40KB.

## Layer claim

Lab L5 — `LabOgExportLink` appends `player_id=00-0036900` for gamelog/dynasty-comps when export omits query; extends base empty-state export with shared PLAYER_SCOPED helper.
