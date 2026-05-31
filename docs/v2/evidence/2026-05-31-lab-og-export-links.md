# Evidence — Lab L5 OG export links (gamelog, efficiency, aging)

**Date:** 2026-05-31  
**Atom:** `lab-og-export-gamelog-efficiency-aging`  
**Verdict:** PASS

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test .venv-v2/bin/python -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Gate C — OG PNG (localhost:3000)

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/gamelog?download=1` | 200 | 58408 | PNG 1200×630, demo rows |
| `/og/efficiency?download=1` | 200 | 59068 | PNG 1200×630, demo rows |
| `/og/aging?download=1` | 200 | 57934 | PNG 1200×630, demo rows |

## In-product

- `LabOgExportLink` on GamelogRenderer, EfficiencyRenderer, AgingCurvesRenderer footers (matches weekly/breakouts pattern).
