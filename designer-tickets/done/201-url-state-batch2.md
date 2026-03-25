<!-- PM: ready -->
---
id: DES-443c
parent: 443 (URL State Epic)
priority: P2
area: 8 standalone HTML pages
section: sharing / URL state
type: feature
status: open
depends_on: DES-443a
---

# Add URL state to analysis pages (batch 2)

**Files**: `frontend/usage.html`, `frontend/yoy.html`, `frontend/airyards.html`, `frontend/redzone.html`, `frontend/efficiency.html`, `frontend/consistency.html`, `frontend/schedule.html`, `frontend/stocks.html`

## What to do

Same pattern as batch 1:
1. On load: `restorePageState()` → set filters
2. On change: `savePageState()` → persist to URL

## Accept when

- Each page encodes position/season/sort to URL params
- Sharing URL restores the exact view
- Default view = clean URL

## Depends on

Ticket 200 / DES-443a (shared helpers)
