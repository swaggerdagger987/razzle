# Evidence — lab-og-percentiles-tolab

**Date:** 2026-05-31  
**Atom:** `lab-og-percentiles-tolab` — Percentiles OG toLab default player hallway  
**Epic:** Lab L5 — pro profile OG live parity (atom 4/4)

## Change

- Pytest guard: `percentiles` in `TOLAB_INCLUDE_DEFAULT_PLAYER_SLUGS` and pro-scoped `LabOgExportLink` (hallway already wired).

## Verification

```text
pytest apps/api/tests/test_lab_og_tolab_watermark.py -q  → 9 passed
npm run build --workspace=apps/web                         → exit 0
curl /og/percentiles?download=1&force_demo=1               → 200 62811 PNG
```

**Reality:** PASS
