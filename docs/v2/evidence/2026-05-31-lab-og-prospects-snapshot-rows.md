# Evidence — Lab L5 prospects OG snapshot rows

**Date:** 2026-05-31  
**Atom:** `lab-og-prospects-snapshot-rows`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?download=1&snapshot=<encoded>'
curl -s -o /tmp/og-prospects-live.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?download=1'
file /tmp/og-prospects-snap.png
```

## Results

- Snapshot curl: **200**, **57867** bytes, PNG 1200×630
- Live (no snapshot): **200**, **58084** bytes, PNG 1200×630

## Change

`ProspectsRenderer` passes top-6 RPS rows + position filter into `LabOgExportLink` so OG matches the in-panel prospect board.
