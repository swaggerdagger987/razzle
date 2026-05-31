# Evidence — league-trade-finder-room-hallway

**Date:** 2026-05-31  
**Atom:** Trade Finder OG — Bones Room ask link on hero deal

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest \
  apps/api/tests/test_trade_finder_og_snapshot.py \
  apps/api/tests/test_trade_finder_og_watermark.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-trade-finder.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/trade-finder?download=1'
# 200 82365
```

## Notes

- OG card shows `razzle.lol/room?...bones...` hallway line above watermark when hero match present.
- `BureauTradeFinderShareBar` adds in-panel `ask Bones about {partner}` link when snapshot has hero.
