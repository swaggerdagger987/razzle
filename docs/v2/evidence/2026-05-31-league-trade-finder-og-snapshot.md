# Evidence — league-trade-finder-og-snapshot

**Date:** 2026-05-31  
**Atom:** `league-trade-finder-og-snapshot` (Trade Finder GTM epic 2/3)  
**Verdict:** PASS

## Gate C — OG PNG

```text
curl -s -o /tmp/og-tf-snap.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/trade-finder?download=1&snapshot=eyJt...'
200 57910
file /tmp/og-tf-snap.png → PNG 1200x630
```

## Tests

```text
JWT_SECRET=test pytest apps/api/tests/test_trade_finder_og_snapshot.py \
  apps/api/tests/test_trade_finder_og_watermark.py -q --noconftest
4 passed
```

## Build

```text
npm run build --workspace=apps/web → exit 0
```
