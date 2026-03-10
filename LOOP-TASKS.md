# Razzle Loop — Phase 57 Task List

> Draft Pick Trade Calculator — Dynasty draft pick values in the Trade Analyzer

**Current Phase**: 57 — Draft Pick Trade Calculator
**Exit Criterion**: Trade Analyzer supports dynasty draft picks (2025 1.01 through 4.12) alongside players. Pick values follow standard dynasty exponential decay curve. Users can evaluate pick-for-pick and pick-for-player trades. Visual pick value chart shows the full value curve. Comic-strip design with chunky borders and position colors.

---

## Task 1: Draft pick value model + backend endpoint
**Status**: PASS
**Notes**: Exponential decay model: A=88, k=0.070, 48 picks. GET /api/trade/pick-values returns all picks with values. 1.01=88.0, 1.12=40.7, 2.01=38.0, 4.12=3.3. Same 0-100 scale as player trade values.

## Task 2: Frontend pick selector in Trade Analyzer
**Status**: PASS
**Notes**: Year/Round/Pick dropdowns + "Add Pick" button on both sides. Pick cards render with round-colored badges (Rd1=terracotta, Rd2=blue, Rd3=teal, Rd4=purple). Picks sum with players for verdict. PNG export handles picks. Value bar segments use round colors.

## Task 3: Visual pick value chart
**Status**: PASS
**Notes**: Canvas-drawn exponential decay curve inside Trade Analyzer. 48 dots colored by round, connected by line. Selected picks highlighted with larger dots + labels. Grid lines, round labels at bottom. 3px ink border, sand background.

## Task 4: Deploy + smoke test
**Status**: PASS
**Notes**: node -c lab.js passes. py_compile passes on server.py and live_data.py. Pick values verified: 48 picks, reasonable dynasty values. All ID references match between HTML and JS.

---

## Loop State
```
Current Phase: 57
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
