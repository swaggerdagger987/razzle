# Evidence — league-trade-finder-og-snapshot

**Date:** 2026-05-31  
**Atom:** Trade Finder OG — snapshot param for in-panel export rows

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_trade_finder_og_snapshot.py \
  apps/api/tests/test_trade_finder_og_watermark.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-trade-finder.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?download=1'
# 200 57910

curl -s -o /tmp/og-tf-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?download=1&snapshot=<panel-encoded>'
# 200 55930
```

## Notes

- `BureauTradeFinderShareBar` encodes in-panel matches via `encodeBureauTradeFinderOgSnapshot`.
- OG route shows `EXPORTED · panel trade rows` sticker when snapshot param present.
- Cycle 146 dedup: content already on `razzle-v2-redesign` at `19a1af0e9`.
