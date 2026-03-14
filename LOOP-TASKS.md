# Razzle Ship Loop — Task Tracker

## Current State
- Phase: Bureau of Intelligence — Trade Network
- Current Task: Task 1 — Build trade network visualization
- Current Stage: BUILD
- Tasks Completed: 0/1
- Loop Iterations: 0

## Phase Spec

**Exit Criterion**: Bureau shows a trade relationship map between all managers.

### Task 1: Build trade network visualization
**Requirement**: Add a "Trade Network" panel showing trade relationships: (1) Trade frequency matrix — grid/table showing how often each pair of managers trades with each other (from Sleeper transaction history), (2) Trade balance — for each pair, who has "won" more trades (compare trade value at time of trade using Razzle valuations), (3) Trade timing — does each manager trade early season, deadline, or offseason? (4) Position tendencies — what positions does each manager trade away vs acquire? (5) "Most likely trade partner" recommendation for the current user based on historical patterns + current roster needs. Pull transaction data from Sleeper API (already fetched in league-intel.html for activity feed). Cross-reference player names with Razzle trade values.
**Accept when**: Trade matrix renders for leagues with trade history. Balance column shows value exchanged. Position tendencies visible per manager. Trade partner recommendation renders.
**Depends on**: none
**Size**: L

## Status
- [ ] Task 1: Build trade network visualization
