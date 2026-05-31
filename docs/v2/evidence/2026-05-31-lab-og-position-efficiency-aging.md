# Evidence — Lab L5 OG position filter (efficiency + aging)

**Date:** 2026-05-31  
**Atom:** `lab-og-position-efficiency-aging`  
**Content commit:** pending metadata

## Curl (Gate C)

| Route | HTTP | Bytes |
|-------|------|-------|
| `/og/efficiency?download=1&position=RB` | 200 | 45113 |
| `/og/aging?download=1&position=RB` | 200 | 44952 |

Both PNG 1200×630, ≥40KB.

## Code

- `EfficiencyRenderer` — `LabOgExportLink` passes `position={position || undefined}`.
- `AgingCurvesRenderer` — `LabOgExportLink` passes `position={position}`.

## Tests

- `JWT_SECRET=test pytest apps/api/tests -q` → 51 passed
- `npm run build --workspace=apps/web` → exit 0

**Reality:** PASS
