<!-- PM: ready -->
---
id: DES-443e
parent: 443 (URL State Epic)
priority: P2
area: 9 standalone HTML pages + sweep
section: sharing / URL state
type: feature
status: open
depends_on: DES-443a
---

# Add URL state to remaining pages (batch 4) + final sweep

**Files**: `frontend/garbagetime.html`, `frontend/seasonpace.html`, `frontend/targetpremium.html`, `frontend/workload.html`, `frontend/leaders.html`, `frontend/scarcity.html`, `frontend/buysell.html`, `frontend/stacks.html`, `frontend/streaks.html`

## What to do

1. Same URL state pattern as batches 1-3
2. After all batches complete, run a final sweep:
   ```bash
   grep -rL 'savePageState\|restorePageState\|history.replaceState' frontend/*.html | grep -v lab.html | grep -v index.html | grep -v warroom.html
   ```
   Any standalone page returned is a miss — add URL state to it.

## Accept when

- All 33 standalone tool pages encode key state to URL params
- Final sweep returns zero misses (excluding lab, index, warroom, about, pricing, 404)
- No regressions in pages from earlier batches

## Depends on

Ticket 200 / DES-443a, Tickets 201-203
