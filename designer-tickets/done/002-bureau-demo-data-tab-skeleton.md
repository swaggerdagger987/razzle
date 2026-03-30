<!-- PM: ready -->
---
id: DES-002
parent: 000-P0 (Bureau Epic)
priority: P0
area: league-intel.html
section: page structure
type: feature
status: open
---

# Bureau: add demo league JSON + 6-tab skeleton

**File**: `frontend/league-intel.html`

## What to do

1. Create a `demoLeague` JSON object inline (or in a `demo-data.js` include) with:
   - 12 managers with fun names ("The Commissioner", "Taco of the League", etc.)
   - Real player names distributed across rosters (top 200 from DB)
   - Standings (some 4-1, some 1-4, some 2-3)
   - Behavioral profiles (2 Panic Sellers, 1 Hoarder, 3 Trade Addicts, etc.)
   - Monte Carlo odds (frontrunner 25%, cellar 2%)
   - 5-10 historical trades

2. Add a horizontal sticky tab bar below the nav:
   - Overview (default) | Self-Scout | Rivals | Trades | Power Rankings | Schedule
   - Tab click shows/hides corresponding `<section>` elements
   - Sand background, chunky active-tab indicator (terracotta underline)

3. Page loads demo data by default — no Sleeper connection required on first visit.

## Accept when

- Page loads without Sleeper and shows tab bar + demo data structure
- All 6 tabs render (content can be placeholder for now)
- Tab switching works
- Dark mode works on tab bar

## Depends on

Nothing — this is the foundation ticket.
