---
id: 20260320-170020-020
severity: P1
confidence: HIGH
flow: lab
flow_name: Lab — FAAB Strategy Panel
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build FAAB strategy panel with historical burn patterns

**PRIORITY: P1** | **Type: structural**
**Page**: lab.html
**Design doc**: docs/NORTH_STAR.md

Add a FAAB (Free Agent Acquisition Budget) strategy panel to the Lab that shows historical waiver spending patterns across leagues. Visualize average FAAB spend by week of season (early-season vs late-season burn rates), by position, and by player breakout type. Help users understand when to be aggressive vs conservative with their budget. Data sourced from Sleeper transactions API aggregate patterns.

### Task 1: Implement FAAB strategy visualization
**Accept when**: The Lab has a "FAAB Strategy" panel showing a bar chart of average FAAB spend by week (weeks 1-17). A position filter shows spend breakdown by QB/RB/WR/TE. The panel includes a "Budget Pacing" guide that recommends how much FAAB to reserve for each phase of the season (early, mid, late, playoffs). Data is derived from historical Sleeper transaction data. Styled with Razzle's card aesthetic.
