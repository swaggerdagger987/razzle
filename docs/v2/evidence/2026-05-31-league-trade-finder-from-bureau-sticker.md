# Evidence — league-trade-finder-from-bureau-sticker

**Atom:** Trust sticker alignment on Trade Finder snapshot OG (League L5 GTM epic 2/3).

## Pytest

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_trade_finder_og_snapshot.py apps/api/tests/test_trade_finder_og_room_hallway.py -q --noconftest
# 4 passed
```

## Change

- `/og/trade-finder` snapshot path: `FROM BUREAU · your trade rows` on trust blue `#5b7fff` (matches Lab FROM PANEL pattern).
