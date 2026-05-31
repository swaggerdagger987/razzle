# Evidence — Trade Finder OG Bones room hallway (2026-05-31)

**Slice:** `league-trade-finder-room-hallway` — OG export + ShareBar link hero deal to Bones in Situation Room.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_trade_finder_og_room_hallway.py apps/api/tests/test_trade_finder_og_snapshot.py -q
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/tf-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/trade-finder?download=1'
# 200 82552
file /tmp/tf-og.png  # PNG 1200x630
```

## Verdict

PASS — OG footer shows `razzle.lol/room?agent=bones&...` with hero give/get labels; ShareBar mirrors in-panel `ask Bones about {partner}` via `@razzle/hallway` `toRoom`.

## Trust

T5 (export fidelity), T6 (hallway cross-room link on export card).
