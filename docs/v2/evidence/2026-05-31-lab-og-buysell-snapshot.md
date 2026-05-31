# Evidence — Lab OG buy-sell snapshot rows

**Date:** 2026-05-31  
**Slice:** Buy-sell in-panel snapshot on OG export  
**Epic atom:** `lab-og-snapshot-rows` (partial — dashboard already on base)

## Gate C

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/buysell?download=1&snapshot=<top6>` | 200 | 42380 | PASS — snapshot rows, "from your panel" label |
| `/og/buysell?download=1` | 200 | 58072 | PASS — demo fallback |

## Build

- `npm run build --workspace=apps/web` — exit 0

## UI

- `BuySellRenderer` passes `ogSnapshotRows` (top 3 buy + top 3 sell) into `LabOgExportLink`.
