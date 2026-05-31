# Evidence — Trade Finder OG watermark user query (2026-05-31)

**Atom:** `league-trade-finder-og-watermark-user`  
**Epic:** League L5 — Bureau OG hallway deep links (2/3)

## Commands

```bash
JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_league_trade_finder_og_toleague_watermark.py \
  apps/api/tests/test_trade_finder_og_watermark.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-trade-finder.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/trade-finder?download=1'
# 200 82365
file /tmp/og-trade-finder.png
# PNG 1200x630
```

## Verdict

**PASS** — watermark band uses `tradeFinderOgWatermarkLink(league, user)` with `?user=` on typed `toLeague` path; demo rows render ≥40KB PNG.
