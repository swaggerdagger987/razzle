# Evidence — Lab L5 player-scoped OG export links

**Date:** 2026-05-31  
**Atom:** `lab-og-export-player-scoped`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Routes (player_id in query)

| Route | HTTP | PNG bytes |
|-------|------|-----------|
| `/og/gamelog?download=1&player_id=00-0036900` | 200 | 58408 |
| `/og/dynasty-comps?download=1&player_id=00-0036900` | 200 | 65961 |

## In-product

- `LabOgExportLink` accepts optional `playerId` → appends `player_id` query param.
- `GamelogRenderer` passes loaded player id to export link.
- `DynastyCompsRenderer` — player search + export with scoped `player_id`.

## Commands

```text
npm run build --workspace=apps/web — exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q — 52 passed, 4 failed (empty terminal.db snapshot/intel; unchanged from VM data stub)
```
