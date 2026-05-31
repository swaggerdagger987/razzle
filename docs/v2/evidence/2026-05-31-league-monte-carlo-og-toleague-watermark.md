# Evidence — League L5 Monte Carlo OG toLeague watermark

**Date:** 2026-05-31  
**Atom:** `league-monte-carlo-og-toleague-watermark`  
**Route:** `/og/monte-carlo`

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_league_monte_carlo_og_toleague_watermark.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-monte-carlo.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/monte-carlo?download=1'
# 200 50820

file /tmp/og-monte-carlo.png
# PNG image data, 1200 x 630
```

## Verdict

**PASS** — demo fallback rows render; watermark band uses `monteCarloOgWatermarkLink` with typed `toLeague(league, "monte-carlo")` and `?user=` when provided. Bureau hallway epic 3/3 complete.
