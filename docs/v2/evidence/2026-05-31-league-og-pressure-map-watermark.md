# Evidence — Pressure Map OG terracotta watermark

**Date:** 2026-05-31  
**Atom:** `league-og-pressure-map-watermark`  
**Epic:** League L5 — Bureau OG terracotta watermark parity (3/4)

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_pressure_map_og_watermark.py -q --noconftest
# 2 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-pressure.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/pressure-map?download=1"
# 200 64029 — PNG 1200×630
```

## Verdict

**PASS** — Always-on terracotta watermark via `toLeague(league, "pressure-map")`; LIVE/SAMPLE trust stickers; same-origin API fetch; curl 64KB PNG.
