# Evidence — League Trade Finder OG snapshot

**Date:** 2026-05-31  
**Atom:** `league-trade-finder-og-snapshot`  
**Epic:** League L5 — Bureau Trade Finder GTM export (atom 2/3)

## Commands

```bash
python3 -m pytest apps/api/tests/test_trade_finder_og_snapshot.py apps/api/tests/test_trade_finder_og_watermark.py -q --noconftest
npm run build --workspace=apps/web

SNAP='eyJtIjpbeyJpZCI6MiwidCI6IlJlYnVpbGQgRkMiLCJnIjp7ImlkIjoicDEiLCJuIjoiSi4gR2liYnMiLCJwIjoiUkIiLCJ2Ijo4NDIwfSwiciI6eyJpZCI6InAyIiwibiI6IkMuIExhbWIiLCJwIjoiV1IiLCJ2Ijo4MzEwfSwiZ3AiOjEuM31dLCJuZCI6WyJXUiJdLCJzdSI6WyJSQiJdfQ'
curl -s -o /tmp/tf-snap.png -w '%{http_code} %{size_download}\n' \
  "http://127.0.0.1:3000/og/trade-finder?download=1&snapshot=$SNAP"
curl -s -o /tmp/tf-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?download=1'
```

## Results

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/trade-finder?download=1&snapshot=…` | 200 | 54790 | PASS — FROM PANEL sticker + in-panel rows |
| `/og/trade-finder?download=1` | 200 | 57910 | PASS — demo fallback |

## Notes

- `BureauTradeFinderShareBar` encodes `snapshot` from in-panel matches.
- OG route skips live API when snapshot decodes with rows.
