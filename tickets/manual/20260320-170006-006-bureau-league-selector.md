---
id: 20260320-170006-006
severity: P0
confidence: HIGH
flow: bureau
flow_name: Bureau — League Selector for Multi-League Users
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build the Bureau league selector for multi-league users

**PRIORITY: P0** | **Type: structural**
**Page**: league-intel.html
**Design doc**: docs/bureau-design.md

Most dynasty players are in 2-5 leagues. After connecting a Sleeper username, the Bureau must detect all dynasty leagues and present a selector so users can switch between them. The most recently active league should be pre-selected. The selector should persist the chosen league in localStorage and re-run Monte Carlo when switching.

### Task 1: Implement league selector component
**Accept when**: Users with 2+ dynasty leagues see a card-based league selector after connecting their Sleeper username. Clicking a league card loads that league's data and re-runs Monte Carlo. The selected league persists in localStorage across page reloads. Users with only 1 league skip the selector entirely.
