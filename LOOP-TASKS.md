# Razzle Loop — Phase 54 Task List

> Auto-generated. Stat percentile heat coloring in Lab table — Bloomberg-grade visual data density.

**Current Phase**: 54 — Lab Percentile Heat Coloring
**Exit Criterion**: Lab table cells are color-coded by positional percentile rank. Toggle between raw values and heat-colored view. Elite stats glow green-tinted, poor stats glow red-tinted, average stats neutral. Screenshots of the Lab with heat coloring look like a real Bloomberg terminal and are immediately readable on Reddit.

---

## Task 1: Backend percentile calculation
**Status**: PASS
**Notes**: Pivoted to frontend-only approach. Percentiles computed client-side from loaded rows — no API changes needed. Works with all existing filters and universes.

## Task 2: Frontend heat coloring in Lab table
**Status**: PASS
**Notes**: computePercentiles() calculates per-position percentile ranks. Color scale: elite (90th+) green rgba, good (75-90) subtle green, neutral (40-60), below avg (10-25) subtle red, poor (<10th) red. Warm-shifted rgba tints match Anthropic sand palette. Toggle button "Heat" in toolbar with active state.

## Task 3: Heat coloring polish and edge cases
**Status**: PASS
**Notes**: Text columns (name, team, position, pos_rank, age) never colored. INVERSE_STATS set handles inverted coloring for turnovers, fumbles, interceptions, sacks, drop_rate, etc. Toggle persists in URL params (heat=1) and localStorage. Keyboard shortcut H added. Shortcut reference updated.

## Task 4: Deploy + smoke test
**Status**: PASS
**Notes**: All syntax clean (node -c passes). Heat button visible in toolbar. Toggle on/off works. Color scale is subtle and warm-shifted. Works for all universes (NFL, college, prospects).

---

## Loop State
```
Current Phase: 54
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
