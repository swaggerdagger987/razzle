# Evidence — League OG Pressure Map terracotta watermark

**Cycle:** 160  
**Atom:** `league-og-pressure-map-watermark`  
**Epic:** League L5 — Bureau OG terracotta watermark parity (3/4)

## Commands

```bash
python3 -m pytest apps/api/tests/test_pressure_map_og_watermark.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-pressure.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/pressure-map?download=1'
```

## Results

- pytest: 1 passed
- web build: exit 0
- curl pressure-map OG: `200` PNG ≥ 40KB (demo rows + terracotta hallway band)

## Verdict

**PASS** — Pressure Map OG matches Self-Scout watermark pattern: `toLeague` deep link, LIVE/SAMPLE stickers, always-on terracotta band.
