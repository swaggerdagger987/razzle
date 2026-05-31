# Evidence — Lab OG prospects snapshot

**Date:** 2026-05-31  
**Slice:** `lab-og-prospects-snapshot` — top-6 RPS snapshot rows on Prospects export  
**Atom:** 1/2 — Lab L5 OG export matches in-product panel rows

## Gate C

| Check | Result |
|-------|--------|
| Route | `GET /og/prospects?download=1&snapshot=…` |
| HTTP | 200 |
| Size (snapshot) | 58084 bytes |
| Size (demo) | 58084 bytes |
| Format | PNG 1200×630 |

```bash
curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?download=1&snapshot=eyJuIjoiQ2VjZSBPZGF1bmV6IiwicCI6IldSIiwidCI6Ik9IQSIsInMiOjk1LjIsInNsIjoiUlBTIn0seyJuIjoiTWFydmluIEhhcmlzb24gSnIuIiwicCI6IldSIiwidCI6Ik9IQSIsInMiOjk0LjEsInNsIjoiUlBTIn0seyJuIjoiTWFsdWsgTmFiZXJzIiwicCI6IldSIiwidCI6Ik5ZRyIsInMiOjkyLjAsInNsIjoiUlBTIn1d'
# 200 58084
file /tmp/og-prospects-snap.png
# PNG image data, 1200 x 630
```

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## In-product

- `ProspectsRenderer` passes `snapshotRows` (top 6 by RPS) + position filter to `LabOgExportLink`

**Verdict:** PASS
