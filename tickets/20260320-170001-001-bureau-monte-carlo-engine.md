---
id: 20260320-170001-001
severity: P0
confidence: HIGH
flow: bureau
flow_name: Bureau — Monte Carlo Championship Engine
found_by: Office Hours Design Doc
date: 2026-03-20
status: TODO
type: structural
---

## Build the Monte Carlo championship probability engine

**PRIORITY: P0** | **Type: structural**
**Page**: league-intel.html
**Design doc**: docs/bureau-design.md (Monte Carlo Specification section)

The Bureau's viral hook is the championship probability number. It doesn't exist yet. Build the Monte Carlo engine as a Web Worker that runs 10,000 simulations in-browser.

**Inputs:** Player PPG mean + stddev from terminal.db (last 3 seasons, min 6 games). Roster data from Sleeper API. League schedule from Sleeper matchups endpoint.

**Simulation:** For each of 10,000 iterations: sample PPG per player via Box-Muller, resolve weekly matchups per actual schedule, determine playoff seeds (top N from league settings), run single-elimination bracket. Championship probability = wins / 10,000.

**Output:** Object mapping manager_id to championship probability (0-100%).

**Performance target:** <2 seconds in Web Worker for 12-team league.

### Task 1: Build Monte Carlo Web Worker
**Accept when**: `new Worker('monte-carlo-worker.js')` accepts league data (rosters, player stats, schedule, settings) and returns championship probabilities for all managers within 2 seconds. Tested with real Sleeper data from at least one dynasty league.
