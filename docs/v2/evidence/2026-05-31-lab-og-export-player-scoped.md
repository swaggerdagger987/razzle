# Evidence — Lab L5 OG export links (player-scoped)

**Date:** 2026-05-31  
**Atoms:** `lab-og-export-player-scoped` (ffccedf4 on base) + supplement (b7deed67 DynastyCompsPanel)  
**Verdict:** PASS

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Gate C — OG PNG (localhost:3000)

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/gamelog?download=1&player_id=00-0036900` | 200 | 58408 | PNG 1200×630 |
| `/og/dynasty-comps?download=1&player_id=00-0036900` | 200 | 65961 | PNG 1200×630, comp rows |

## In-product

- `LabOgExportLink` appends `player_id` when provided (`ffccedf4`).
- `DEFAULT_LAB_OG_PLAYER_ID` on gamelog export when no player selected (`b7deed67`).
- `/lab/dynasty-comps` footer export via `DynastyCompsPanel` (`b7deed67`).
