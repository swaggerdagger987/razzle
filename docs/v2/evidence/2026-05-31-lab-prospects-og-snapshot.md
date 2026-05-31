# Evidence — Lab prospects OG snapshot rows

**Date:** 2026-05-31  
**Atom:** `lab-prospects-og-snapshot`  
**Verdict:** PASS (Gate C2)

## Change

`ProspectsRenderer` builds `ogSnapshotRows` from loaded prospects (top 6 by RPS) and passes `snapshotRows` + optional `position` to `LabOgExportLink`.

## curl (dev :3000)

```bash
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?download=1'
# 200 58084

curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?snapshot=<encoded>&download=1'
# 200 40804
```

## Build / tests

- `npm run build --workspace=apps/web` — PASS
- `pytest apps/api/tests -q` — 52 passed; 4 screener snapshot failures (data drift, unchanged by slice)
