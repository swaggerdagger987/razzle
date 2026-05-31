# Evidence — Lab OG export links (prospects + weekly + tradevalues)

**Date:** 2026-05-31  
**Slice:** `lab-og-export-link-prospects-weekly-tradevalues`  
**Atom:** 3/3 — Lab L5 live-rows epic (final atom)

## Changes

- `ProspectsRenderer.tsx` — `LabOgExportLink` slug `prospects`
- `WeeklyHeatmapRenderer.tsx` — `LabOgExportLink` slug `weekly`
- `TradeValuesRenderer.tsx` — `LabOgExportLink` slug `tradevalues`

## Verification

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 52 passed (4 screener snapshot fails pre-existing on base)
curl /og/prospects?download=1   → 200 58084 bytes PNG 1200×630
curl /og/weekly?download=1      → 200 63819 bytes PNG 1200×630
curl /og/tradevalues?download=1 → 200 62488 bytes PNG 1200×630
```

## Verdict

**PASS** — FACTORY-DOD Gate C2 satisfied (PNG ≥40KB). Epic complete after merge.
