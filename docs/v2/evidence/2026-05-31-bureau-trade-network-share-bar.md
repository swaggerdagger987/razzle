# Evidence — Bureau Trade Network share bar

**Date:** 2026-05-31  
**Slice:** `bureau-trade-network-share-bar` — copy network URL + export card  
**Atom:** 2/4 — League L5 Bureau share row parity

## Gate C

| Check | Result |
|-------|--------|
| Route | `GET /og/trade-network?league=test&download=1` |
| HTTP | 200 |
| Size | 68090 bytes |
| Format | PNG 1200×630 |

```bash
curl -s -o /tmp/og-trade-network.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/trade-network?league=test&download=1'
# 200 68090
file /tmp/og-trade-network.png
# PNG image data, 1200 x 630
```

## Build

- `npm run build --workspace=apps/web` — exit 0
- `npm run typecheck --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 52 passed, 4 failed (screener snapshot drift; same class fails on base without web changes)

## In-product

- `BureauTradeNetworkShareBar` — copy network link + export with `league` query on OG

**Verdict:** PASS
