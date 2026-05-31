# Evidence — league-og-pressure-map-watermark

**Date:** 2026-05-31  
**Atom:** `league-og-pressure-map-watermark` — Pressure Map OG terracotta watermark + LIVE/SAMPLE stickers  
**Trust:** T5, T6

## Commands

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_pressure_map_og_watermark.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-pm.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/pressure-map?download=1'
file /tmp/og-pm.png
```

## Results

| Check | Output |
|-------|--------|
| pytest | 1 passed |
| web build | exit 0 |
| curl pressure-map OG | `200 64347` |
| file | PNG 1200×630 |

## Behavior

- Terracotta watermark band uses `@razzle/hallway` `toLeague(league, "pressure-map")`.
- LIVE / SAMPLE stickers match Self-Scout + Trade Finder Bureau OG pattern.
- `resolveApiOrigin(req)` for edge OG → same-origin API rewrites.

## Verdict

PASS — Bureau watermark parity epic atom 2/4.
