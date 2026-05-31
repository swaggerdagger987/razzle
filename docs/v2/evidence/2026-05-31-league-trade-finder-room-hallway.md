# Evidence — league-trade-finder-room-hallway

**Date:** 2026-05-31  
**Atom:** Trade Finder OG — Bones Room ask link on hero deal  
**Route:** `/og/trade-finder?download=1`

## Curl

```
200 81462
```

PNG: 1200×630 (`file /tmp/og-tf.png`).

## Tests

```
JWT_SECRET=test python3 -m pytest apps/api/tests/test_trade_finder_og_watermark.py apps/api/tests/test_trade_finder_og_snapshot.py -q --noconftest
5 passed
```

## Verdict

PASS — Gate C2 satisfied; OG shows `toRoom` Bones deep link on hero match.
