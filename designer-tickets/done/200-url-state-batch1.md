<!-- PM: ready -->
---
id: DES-443b
parent: 443 (URL State Epic)
priority: P2
area: 7 standalone HTML pages
section: sharing / URL state
type: feature
status: open
depends_on: DES-443a
---

# Add URL state to high-traffic standalone pages (batch 1)

**Files**: `frontend/tradevalues.html`, `frontend/rankings.html`, `frontend/breakouts.html`, `frontend/aging.html`, `frontend/weekly.html`, `frontend/targets.html`, `frontend/matchups.html`

## What to do

In each page:
1. On load: call `restorePageState()` to read URL params and set position/season/sort
2. On filter/sort change: call `savePageState()` to persist to URL

Typical params: `?pos=QB&season=2024&sort=value`

## Accept when

- Filtering to WR on tradevalues.html → URL updates to `?pos=WR`
- Sharing that URL → recipient sees WR-filtered view
- Default view has clean URL (no params)

## Depends on

Ticket 200 / DES-443a (shared helpers)
