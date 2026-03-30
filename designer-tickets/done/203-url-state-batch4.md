<!-- PM: ready -->
---
id: DES-443e
parent: 443 (URL State Epic)
priority: P2
area: 9 standalone HTML pages
section: sharing / URL state
type: feature
status: open
depends_on: DES-443a
---

# Add URL state to remaining pages (batch 4)

**Files**: `frontend/garbagetime.html`, `frontend/seasonpace.html`, `frontend/targetpremium.html`, `frontend/workload.html`, `frontend/leaders.html`, `frontend/scarcity.html`, `frontend/buysell.html`, `frontend/stacks.html`, `frontend/streaks.html`

## What to do

Same URL state pattern as batches 1-3:
1. On load: `restorePageState()` → set filters
2. On change: `savePageState()` → persist to URL

## Accept when

- Each page encodes key state to URL params
- Sharing URL restores the exact view
- Default view = clean URL

## Depends on

Ticket 200 / DES-443a (shared helpers)
