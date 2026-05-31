# Evidence — league-trade-finder-og-snapshot (2026-05-31)

## Acceptance

```text
pytest apps/api/tests/test_trade_finder_og_snapshot_codec.py apps/api/tests/test_trade_finder_og_watermark.py -q
# 5 passed

cd apps/web && npm run build
# ✓ Compiled successfully
```

## Gate C — OG PNG with snapshot fixture

```bash
curl -s -o /tmp/trade-finder-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/trade-finder?download=1&snapshot=<DEMO_SNAPSHOT_PARAM>"
# 200 56868
file /tmp/trade-finder-og.png
# PNG image data, 1200 x 630
```

ShareBar encodes in-panel `matches` / `hero_match` via `encodeBureauTradeFinderOgSnapshot`;
OG route prefers snapshot over live API and labels `LIVE · exported trade rows`.
