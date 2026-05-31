# Evidence — Bureau H2H share bar

**Date:** 2026-05-31  
**Slice:** `bureau-h2h-share-bar` — copy rivalry URL + export card  
**Atom:** 1/3 — League L5 Bureau H2H export travels

## Gate C

| Check | Result |
|-------|--------|
| Route | `GET /og/head-to-head?download=1` |
| HTTP | 200 |
| Size | 59305 bytes |
| Format | PNG 1200×630 |

```bash
curl -s -o /tmp/og-h2h.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/head-to-head?download=1'
# 200 59305
file /tmp/og-h2h.png
# PNG image data, 1200 x 630
```

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## In-product

- `BureauH2HShareBar` — copy rivalry link + export with `league`, `user`, `opponent` query params
- OG subtitle Satori fix — single text child on blurb line (unblocked 500 on export)

**Verdict:** PASS
