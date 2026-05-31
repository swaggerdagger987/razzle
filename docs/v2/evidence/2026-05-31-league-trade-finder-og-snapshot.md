# Evidence — league-trade-finder-og-snapshot

**Date:** 2026-05-31  
**Atom:** Trade Finder OG — snapshot param for in-panel export rows  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests/test_trade_finder_og_snapshot.py \
  apps/api/tests/test_trade_finder_og_watermark.py -q --noconftest
curl -s -o /tmp/tf-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?download=1&league=demo&user=u1&snapshot=<encoded>'
file /tmp/tf-snap.png
```

## Results

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 55414 bytes (≥ 40KB) |
| pytest | 4 passed |

## Change

`BureauTradeFinderShareBar` encodes panel matches into `snapshot` query param; `/og/trade-finder` decodes and renders LIVE rows without API round-trip.
