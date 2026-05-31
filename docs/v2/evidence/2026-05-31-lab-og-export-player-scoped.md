# Evidence — Lab OG export player-scoped links

**Date:** 2026-05-31  
**Slice:** `lab-og-export-player-scoped` (epic atom 3/3)  
**Verdict:** PASS (Gate C)

## Routes (player_id=00-0036900)

| Route | HTTP | Bytes |
|-------|------|-------|
| `/og/gamelog?download=1&player_id=00-0036900` | 200 | 58408 |
| `/og/dynasty-comps?download=1&player_id=00-0036900` | 200 | 65961 |

## Build

- `npm run build --workspace=apps/web` — exit 0

## Product

- `LabOgExportLink` appends `player_id` query when provided.
- Gamelog footer passes active panel player id.
- Dynasty comps footer on `DashboardRenderer` when `comps` rows present.
