# Evidence — league-og-pressure-map-watermark

**Date:** 2026-05-31  
**Atom:** Pressure Map OG terracotta watermark band  
**Verdict:** PASS

## Gate C — OG PNG

```bash
curl -s -o /tmp/pressure-map-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/pressure-map?download=1&force_demo=1'
# 200 63349

file /tmp/pressure-map-og.png
# PNG 1200x630
```

- Route: `/og/pressure-map` with `force_demo=1`
- Size ≥40KB — terracotta hallway band + SAMPLE sticker visible

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests/test_pressure_map_og_watermark.py -q` — 1 passed
