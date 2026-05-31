# Evidence — Trade Finder OG Bones Room hallway (2026-05-31)

**Slice:** `league-trade-finder-room-hallway` — Bones Room ask link on hero deal in `/og/trade-finder`.

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_trade_finder_og_room_hallway.py -q
npm run build --workspace=apps/web
curl -s -o /tmp/trade-finder-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/trade-finder?download=1'
```

## Verdict

PASS — OG footer shows `razzle.lol/room?agent=bones&...` with hero deal question; mirrors in-panel `ask Bones about this deal` via `@razzle/hallway` `toRoom`.

## Trust

T5 (export fidelity), T6 (hallway cross-room link on export card).
