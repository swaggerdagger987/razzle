# Evidence — lab-og-player-scoped-slugs-full

**Cycle:** 132 (workday cycle 1)  
**Atom:** `lab-og-player-scoped-slugs-full`  
**Date:** 2026-05-31

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test pytest apps/api/tests/test_lab_og_export_player_default.py -q` | 1 passed |

## Change summary

- `LabOgExportLink.tsx`: `PLAYER_SCOPED_OG_SLUGS` Set includes percentiles, career, career-compare, strengths, breakdown, fptsbreakdown, archetypes (beyond cycle 130 gamelog/dynasty-comps).
- `resolvedPlayerId` defaults `DEFAULT_LAB_OG_PLAYER_ID` for any scoped slug.

## Gate C

Link-only slice; no new OG route. N/A.

## Verdict

**PASS**
