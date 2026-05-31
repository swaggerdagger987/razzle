# Evidence — Lab OG dynasty rankings position filter

**Date:** 2026-05-31  
**Slice:** `lab-og-filter-position-rankings`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web          # exit 0
curl -s -o /tmp/og-rankings-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/rankings?download=1&position=WR'
# 200 50793
curl -s -o /tmp/og-rankings-all.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/rankings?download=1'
# 200 (baseline)
```

## Notes

- `LabOgExportLink` gains `position`; OG route filters demo/API rows when no snapshot.
- `DynastyRankingsRenderer` passes `snapshotRows` from visible sorted players + `position` fallback.
