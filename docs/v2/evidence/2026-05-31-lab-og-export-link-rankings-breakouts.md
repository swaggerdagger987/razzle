# Evidence — Lab OG export links (rankings + breakouts)

**Date:** 2026-05-31  
**Slice:** `lab-og-export-link-rankings-breakouts`  
**Atom:** 2/3 — Lab L5 live-rows epic

## Changes

- `DynastyRankingsRenderer.tsx` — `LabOgExportLink` slug `rankings`
- `BreakoutsRenderer.tsx` — `LabOgExportLink` slug `breakouts`

## Verification

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
curl /og/rankings?download=1  → 200 59509 bytes PNG 1200×630
curl /og/breakouts?download=1 → 200 60649 bytes PNG 1200×630
```

## Verdict

**PASS** — FACTORY-DOD Gate C2 satisfied (PNG ≥40KB).
