# Razzle Ship Loop — Task Tracker

## Current State
- Phase: Bureau of Intelligence — Waiver Tendencies
- Current Task: Task 1 — Build waiver analysis panel
- Current Stage: BUILD
- Tasks Completed: 0/1
- Loop Iterations: 0

## Phase Spec

**Exit Criterion**: Bureau shows waiver/FA analysis per manager.

### Task 1: Build waiver analysis panel
**Requirement**: Add waiver/FA analysis per manager: (1) FAAB budget remaining vs spent (if FAAB league — check league settings), (2) Total waiver claims count per season, (3) Position bias — what positions do they claim most? (4) Hit rate — of their pickups, how many were still rostered 4+ weeks later? (estimate from transaction history), (5) "Waiver hawk" score 0-100 measuring aggressiveness (claims per week, FAAB spend rate, speed of claims). Use existing transaction data already parsed from Sleeper API in league-intel.html. Display as chunky cards with bar charts per manager, sorted by hawk score.
**Accept when**: Waiver panel renders with real transaction data. FAAB tracking works for FAAB leagues. Hawk score differentiates aggressive vs passive managers. Position bias visible.
**Depends on**: none
**Size**: L

## Status
- [ ] Task 1: Build waiver analysis panel
