# Evidence — league-trade-finder-room-hallway

**Date:** 2026-05-31  
**Atom:** Trade Finder OG — Bones Room ask link on hero deal  
**Verdict:** PASS (Gate C)

## Commands

```bash
python3 -m pytest apps/api/tests/test_trade_finder_og_room_hallway.py apps/api/tests/test_trade_finder_og_watermark.py -q --noconftest
# 2 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-trade-finder.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?download=1'
# 200 84906
```

## Gate C

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 84906 B |
| Route | `/og/trade-finder` |
