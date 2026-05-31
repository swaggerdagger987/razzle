# Evidence — Lab OG snapshot export (tradevalues + prospects)

**Date:** 2026-05-31  
**Slice:** `lab-og-snapshot-tradevalues-prospects`  
**Atom:** 1/3 — Lab L5 OG mirrors in-panel rows epic

## Changes

- `TradeValuesRenderer.tsx` — `ogSnapshotRows` from visible bar chart (trade value or formula score)
- `ProspectsRenderer.tsx` — `ogSnapshotRows` from Big Board RPS column

## Verification

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
curl /og/prospects?download=1&snapshot=<panel>  → 200 45583 bytes PNG
curl /og/tradevalues?download=1&snapshot=<panel> → 200 62488 bytes PNG
curl /og/prospects?download=1  → 200 58084 bytes (live/demo fallback)
curl /og/tradevalues?download=1 → 200 62488 bytes
```

Snapshot blurb shows "from your panel" per `panelBlurbSuffix` when `snapshot` param present.

## Verdict

**PASS** — FACTORY-DOD Gate C2 satisfied (PNG ≥40KB with named rows).
