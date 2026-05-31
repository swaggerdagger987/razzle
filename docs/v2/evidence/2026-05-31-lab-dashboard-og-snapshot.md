# Evidence — lab-dashboard-og-snapshot

**Date:** 2026-05-31  
**Atom:** `lab-dashboard-og-snapshot`  
**Verdict:** PASS

## Dedup note

`lab-tradevalues-og-snapshot` and `lab-prospects-og-snapshot` already on `origin/razzle-v2-redesign` via `1a56450e`. This cycle shipped dashboard/comps snapshot only.

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-dc.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3001/og/dynasty-comps?download=1'
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| OG dynasty-comps | `200 65961` bytes PNG |

## Change

`DashboardRenderer` passes `ogSnapshotRows` (top-6 comp match %) into `LabOgExportLink` for roster-grade style dashboard payloads with `comps[]`.
