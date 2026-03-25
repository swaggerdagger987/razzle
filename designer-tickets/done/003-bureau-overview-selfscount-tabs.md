<!-- PM: ready -->
---
id: DES-003
parent: 000-P0 (Bureau Epic)
priority: P0
area: league-intel.html
section: Overview + Self-Scout tabs
type: feature
status: open
---

# Bureau: Overview tab (Monte Carlo + storylines) + Self-Scout tab

**File**: `frontend/league-intel.html`

## Overview tab

- Razzle executive summary card: "Here's your league at a glance."
- Monte Carlo odds grid: 12 managers, championship % and playoff %
- Top 3 storylines with agent attribution (Hawkeye, Bones, Atlas)
- This is the screenshot moment.

## Self-Scout tab

- One manager's full roster analysis (demo: pick manager #1)
- Starter quality by position (A/B/C/D grades)
- Depth score (0-100)
- Build profile badge (Hero RB / Zero RB / Stars & Scrubs)
- Vulnerability flags
- Hawkeye usage trend arrows on starters

## Design

- Sand cards, 3px borders, 4px offset shadows
- Agent avatar icons (20px) next to section headers
- Space Mono for all data, Caveat for agent annotations

## Accept when

- Overview tab renders Monte Carlo grid with 12 managers + percentages
- 3 agent-attributed storylines display
- Self-Scout tab shows roster breakdown with grades
- Both tabs use demo data from DES-002

## Depends on

DES-002 (demo data + tab skeleton)
