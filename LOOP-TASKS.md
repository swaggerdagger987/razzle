# Razzle Ship Loop — Task Tracker

## Current State
- Phase: Bureau of Intelligence — Roster Depth Analysis
- Current Task: Task 1 — Build Roster Depth panel
- Current Stage: BUILD
- Tasks Completed: 0/1
- Loop Iterations: 0

## Phase Spec

**Exit Criterion**: Bureau has a "Roster Depth" panel showing every manager's depth by position with vulnerability flags.

### Task 1: Build Roster Depth panel
**Requirement**: Add a "Roster Depth" panel to the Bureau (league-intel.html) that analyzes every manager's roster depth by position. For each manager show: (1) Starter quality — average PPG of top starters at each position slot (1QB, 2RB, 2WR, 1TE, 1FLEX), (2) Bench depth — average PPG of remaining players by position, (3) Depth score — 0-100 composite of starter + bench quality, (4) Vulnerability flags — positions where they have only 1 startable player (one injury from disaster), (5) Visual stacked bar chart per manager showing starter vs bench strength by position. Color: green = deep, yellow = thin, red = vulnerable. Sort managers by overall depth score. Use Sleeper roster data cross-referenced with Razzle player stats from terminal.db (PPG lookup via `/api/players` or existing trade value data). Chunky Razzle card styling per DESIGN.md.
**Accept when**: Depth panel renders for a connected Sleeper league. Each manager shows starter quality, bench depth, depth score, and vulnerability flags. Bar chart renders. Sorted by depth score. Matches DESIGN.md styling.
**Depends on**: none
**Size**: L

## Status
- [ ] Task 1: Build Roster Depth panel
