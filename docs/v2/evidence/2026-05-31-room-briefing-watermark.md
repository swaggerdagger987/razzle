# Evidence — room-briefing-watermark (2026-05-31)

## Slice

Briefing OG terracotta watermark band uses `toRoom` hallway deep link (not generic `/room`).

## Commands

```bash
python3 -m pytest apps/api/tests/test_briefing_og_route.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/briefing-og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/briefing?download=1"
# 200 89235

file /tmp/briefing-og.png
# PNG image data, 1200 x 630
```

## Verdict

PASS — Gate C satisfied (PNG ≥ 40KB, demo fallback via DEMO constant).
