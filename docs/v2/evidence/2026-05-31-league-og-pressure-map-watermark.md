# Evidence — league-og-pressure-map-watermark

**Date:** 2026-05-31  
**Atom:** `league-og-pressure-map-watermark` — Pressure Map OG terracotta hallway band + LIVE/SAMPLE stickers  
**Verdict:** PASS

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-pressure.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/pressure-map?download=1'
# 200 65660

file /tmp/og-pressure.png
# PNG 1200x630
```

## Tests / build

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_pressure_map_og_watermark.py -q --noconftest
# 1 passed

npm run build --workspace=apps/web
# exit 0
```
