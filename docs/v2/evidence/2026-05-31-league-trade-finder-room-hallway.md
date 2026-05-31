# Evidence — league-trade-finder-room-hallway

**Date:** 2026-05-31  
**Atom:** `league-trade-finder-room-hallway` — Bones Room ask deep link on Trade Finder OG hero deal.

## Gate C

```bash
curl -s -o /tmp/og-tf-room.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?download=1'
# 200 82365
file /tmp/og-tf-room.png  # PNG 1200x630
```

Route includes `toRoom` with Bones + hero trade question (mirrors in-panel `BureauTradeFinder` link).

## Tests

- `pytest apps/api/tests/test_trade_finder_og_room_hallway.py` (+ snapshot + watermark) — 5 passed
- `npm run build --workspace=apps/web` — exit 0

**Verdict:** PASS
