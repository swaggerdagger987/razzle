# Evidence — Lab prospects OG snapshot rows

**Date:** 2026-05-31  
**Atom:** `lab-prospects-og-snapshot`  
**Verdict:** PASS (Gate C2)

## Change

`ProspectsRenderer` builds `ogSnapshotRows` from loaded prospect cards (top 6 by RPS, school as team) and passes `snapshotRows` + `position` to `LabOgExportLink`.

## curl (dev server :3000)

```bash
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?download=1'
# 200 58084

curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?snapshot=<encoded>&download=1'
# 200 58084
```

PNG ≥40KB. `file` reports 1200×630 RGBA.

## Build / tests

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
