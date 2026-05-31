# Evidence — Bureau Pressure Map share bar

**Date:** 2026-05-31  
**Slice:** `bureau-pressure-map-share-bar` — copy pressure URL + export card  
**Atom:** 1/4 — League L5 Bureau share row parity

## Gate C

| Check | Result |
|-------|--------|
| Route | `GET /og/pressure-map?download=1` |
| HTTP | 200 |
| Size | 60104 bytes |
| Format | PNG 1200×630 |

```bash
curl -s -o /tmp/og-pressure.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/pressure-map?download=1'
# 200 60104
file /tmp/og-pressure.png
# PNG image data, 1200 x 630
```

## Build

- `npm run build --workspace=apps/web` — exit 0
- `npm run typecheck --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## In-product

- `BureauPressureMapShareBar` — copy pressure link + export with `league` query on OG

**Verdict:** PASS
