# Evidence — Trade Finder OG watermark + LIVE stickers (2026-05-31)

**Atom:** `league-trade-finder-og-watermark-live`  
**Epic:** League L5 — Bureau Trade Finder GTM export (atom 1/3)

## Gate C

```bash
curl -s -o /tmp/og-tf.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?download=1'
# 200 57910

file /tmp/og-tf.png
# PNG image data, 1200 x 630
```

## Pytest

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_trade_finder_og_watermark.py -q --noconftest
# 1 passed
```

## Build

```bash
npm run build --workspace=apps/web
# exit 0
```

## Hallway

- Watermark band uses `@razzle/hallway` `toLeague(league, "trade-finder")` for deep link.
- LIVE / SAMPLE stickers match Bureau H2H OG pattern.
