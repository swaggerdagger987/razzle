# Evidence — lab-og-gamelog-player-default

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-player-default`  
**Room:** Lab L5

## Gate C — PNG curl

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/gamelog?download=1` | 200 | 60634 | PASS |
| `/og/gamelog?download=1&player_id=00-0036900` | 200 | 60634 | PASS |

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 61 passed, 5 skipped

## Change

`LabOgExportLink` injects `DEFAULT_LAB_OG_PLAYER_ID` on player-scoped OG slugs (including gamelog) when the export link omits `playerId`, so share URLs always carry `player_id` for live nflverse rows.
