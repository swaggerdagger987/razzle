---
id: 20260320-170010-010
severity: P1
confidence: HIGH
flow: bureau
flow_name: Bureau — Scenario Explorer Re-Simulation (PRO)
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build the Bureau scenario explorer for "what if I trade X?" re-simulation

**PRIORITY: P1** | **Type: structural**
**Page**: league-intel.html
**Design doc**: docs/bureau-design.md

The scenario explorer is PRO-gated. It lets users hypothetically move players between rosters and re-run the Monte Carlo simulation to see how their championship odds change. This is the "killer feature" that makes the Bureau sticky — users can evaluate trades before proposing them. The UI should show a before/after odds comparison with a delta indicator.

### Task 1: Implement scenario explorer with re-simulation
**Accept when**: Pro users can select a player from their roster to "trade away" and a player from a rival roster to "receive." Clicking "Simulate" re-runs Monte Carlo with the modified rosters and shows before/after championship odds for both managers, plus the delta. The simulation runs in the existing Web Worker. Free users see a locked panel with a description of the feature and upgrade CTA.
