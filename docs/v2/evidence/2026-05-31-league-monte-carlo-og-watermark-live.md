# Evidence — league-monte-carlo-og-watermark-live

**Date:** 2026-05-31  
**Atom:** Monte Carlo OG — LIVE/SAMPLE stickers + terracotta watermark band  
**Verdict:** PASS

## Gate C

```bash
curl -s -o /tmp/og-monte-carlo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/monte-carlo?download=1'
# 200 58174
file /tmp/og-monte-carlo.png
# PNG 1200x630
```

## Contract

```bash
pytest apps/api/tests/test_monte_carlo_og_watermark.py -q --noconftest
# 1 passed
npm run build --workspace=apps/web
# exit 0
```
