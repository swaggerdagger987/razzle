# Evidence — league-roster-depth-og-watermark

**Date:** 2026-05-31  
**Atom:** `league-roster-depth-og-watermark`  
**Cycle:** 154

## Contract

- `apps/web/app/og/roster-depth/route.tsx` — terracotta watermark band, `toLeague` + `toRoom`, LIVE/SAMPLE stickers, `resolveApiOrigin`
- `apps/api/tests/test_roster_depth_og_watermark.py` — source contract

## Commands

```bash
python3 -m pytest apps/api/tests/test_roster_depth_og_watermark.py -q --noconftest
# 1 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-roster-depth.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/roster-depth?league=demo&download=1'
# 200 79892

file /tmp/og-roster-depth.png
# PNG image data, 1200 x 630
```

## Verdict

**PASS** — Gate C: demo roster-depth OG ≥40KB with position grade rows + terracotta watermark band.
