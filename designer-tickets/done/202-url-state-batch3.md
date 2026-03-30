<!-- PM: ready -->
---
id: DES-443d
parent: 443 (URL State Epic)
priority: P2
area: 9 standalone HTML pages
section: sharing / URL state
type: feature
status: open
depends_on: DES-443a
---

# Add URL state to tool pages (batch 3)

**Files**: `frontend/opportunity.html`, `frontend/reportcard.html`, `frontend/awards.html`, `frontend/vorp.html`, `frontend/tradefinder.html`, `frontend/advantage.html`, `frontend/dualthreat.html`, `frontend/tdregression.html`, `frontend/snapefficiency.html`

## What to do

Same pattern as batch 1-2:
1. On load: `restorePageState()` → set filters
2. On change: `savePageState()` → persist to URL

Note: `tradefinder.html` already has `?player=ID` for search — extend, don't replace.

## Accept when

- Each page encodes state to URL params
- tradefinder.html preserves existing ?player= param alongside new params
- Sharing URL restores exact view

## Depends on

Ticket 200 / DES-443a (shared helpers)
