# Evidence — Trade Finder OG Bones Room hallway (2026-05-31)

**Slice:** `league-trade-finder-room-hallway` — OG footer + ShareBar Bones deep-link on hero deal.

## Commands

```bash
pytest apps/api/tests/test_trade_finder_og_room_hallway.py apps/api/tests/test_trade_finder_og_watermark.py -q --noconftest  # 3 passed
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-trade-finder.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?download=1'
# 200 81778
file /tmp/og-trade-finder.png  # PNG 1200x630
```

## Verdict

PASS — OG shows `razzle.lol/room?agent=bones&...` with hero partner team; ShareBar mirrors in-panel `ask Bones about {team}` via `@razzle/hallway` `toRoom`.

## Trust

T5 (export fidelity), T6 (hallway cross-room link on export card).
