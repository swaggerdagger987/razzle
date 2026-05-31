# Evidence — Bureau Pressure Map copy link

**Date:** 2026-05-31  
**Slice:** `bureau-pressure-map-copy-link` — copy deadline chart URL + export card  
**Atom:** 4/4 — League L5 Bureau share row export travels

## Gate C

| Check | Result |
|-------|--------|
| Route | `GET /og/pressure-map?download=1` |
| HTTP | 200 |
| Size | 60104 bytes |
| Format | PNG 1200×630 |

```bash
curl -s -o /tmp/og-pm.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/pressure-map?download=1'
# 200 60104
file /tmp/og-pm.png
# PNG image data, 1200 x 630
```

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## In-product

- `BureauPressureMap` footer — `copy chart link` copies `/league/{id}/pressure-map` URL beside existing export card

**Verdict:** PASS
