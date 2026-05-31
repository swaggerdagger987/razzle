# Evidence — Trade Finder Bones Room hallway (2026-05-31)

**Slice:** `league-trade-finder-og-room-hallway` — OG footer + ShareBar Bones Room deep-link on hero trade match.

## Commands

```bash
python3 -m pytest apps/api/tests/test_trade_finder_og_room_hallway.py apps/api/tests/test_trade_finder_og_watermark.py -q --noconftest
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/tf-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?download=1'
```

## Verdict

PASS — OG shows `razzle.lol/room?agent=bones&...` with partner team label; ShareBar mirrors in-panel `ask Bones about {team}` via `@razzle/hallway` `toRoom`.

## Trust

T5 (export fidelity), T6 (hallway cross-room link on export card).
