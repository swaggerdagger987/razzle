# Evidence — league-trade-finder-room-hallway

**Date:** 2026-05-31  
**Atom:** `league-trade-finder-room-hallway` — Bones Room ask link on Trade Finder OG hero  
**Trust:** T5, T6

## Build

- `JWT_SECRET=test python3 -m pytest apps/api/tests/test_trade_finder_og_room_hallway.py apps/api/tests/test_trade_finder_og_snapshot.py -q --noconftest` — 4 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C

```bash
curl -s -o /tmp/og-tf.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?download=1'
# 200 57910+
```

## Verdict

PASS — Trade Finder OG shows Bones `toRoom` path on hero deal; PNG ≥40KB.
