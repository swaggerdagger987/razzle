# Evidence — lab-og-gamelog-player-default

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-player-default`  
**Verdict:** PASS (FACTORY-DOD Gate C2)

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 63 passed, 4 failed (intel/snapshot env — not slice paths)

## Gate C — OG PNG curl

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/gamelog?download=1&player_id=00-0036900` | 200 | 60634 | PASS |
| `/og/gamelog?download=1` (PLAYER_SCOPED default) | 200 | 60634 | PASS |

Both PNGs: 1200×630, ≥40KB.

## Layer claim

Lab L5 — `LabOgExportLink` centralizes `player_id=00-0036900` for gamelog/dynasty-comps when export omits query; `GamelogRenderer` delegates default to helper.
