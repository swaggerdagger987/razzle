<!-- PM: ready -->
---
id: DES-443f
parent: 443 (URL State Epic)
priority: P2
area: all standalone HTML pages
section: sharing / URL state
type: verification
status: open
depends_on: DES-443a, DES-443b, DES-443c, DES-443d, DES-443e
---

# URL state final sweep — verify all 33 standalone pages

## What to do

After batches 1-4 are complete, run:
```bash
grep -rL 'savePageState\|restorePageState\|history.replaceState' frontend/*.html | grep -v lab.html | grep -v index.html | grep -v warroom.html | grep -v about.html | grep -v pricing.html | grep -v 404.html
```

Any standalone page returned is a miss — add URL state to it.

## Accept when

- Final sweep returns zero misses (excluding lab, index, warroom, about, pricing, 404)
- No regressions in pages from earlier batches (200-203)
- Spot-check 3 random pages: filter → copy URL → new tab → view matches

## Depends on

All URL state batches (200, 201, 202, 203)
