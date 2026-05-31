# Evidence — lab-og-gamelog-player-default

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-player-default`  
**Room:** Lab L5

## Gate C — PNG curl

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/gamelog?download=1` | 200 | 60634 | PASS |

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 61 passed, 5 skipped

## Change

`LabOgExportLink` injects `DEFAULT_LAB_OG_PLAYER_ID` on player-scoped OG slugs when export omits `playerId`.
