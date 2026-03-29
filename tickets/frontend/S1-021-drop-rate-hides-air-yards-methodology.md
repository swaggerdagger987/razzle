# S1-021: Drop rate page hides air-yards <15 methodology from users

**Severity**: S1 (Major)
**Category**: football-accuracy
**Source**: Deep Audit 2026-03-28, finding S1-009

## Problem

The drop rate metric only counts incompletions on throws with air yards < 15 as
"drops," but this methodology is never disclosed to the user. This leads to
confusing numbers — e.g., Puka Nacua 2025 shows 129 receptions, 23 drops (17.8%
drop rate), and 77.7% catch rate. Users cannot reconcile these numbers without
knowing the <15 air yards threshold.

## Root Cause

- `adapters/nflverse_adapter.py:991-994` — Drop detection logic:
  ```python
  if not is_complete and not is_interception:
      if air_yards is not None and air_yards < 15:
          ra["drops"] += 1
  ```
  Only incomplete, non-intercepted passes with air yards < 15 count as drops.

- `adapters/nflverse_adapter.py:1075` — Drop rate calculation:
  ```python
  dr = round(a["drops"] / a["target_count"], 3)
  ```
  Drop rate = drops / ALL targets (not just short targets), which inflates the
  denominator relative to the numerator.

- `frontend/drops.html:97-98` — A methodology tooltip EXISTS but is hover-only:
  ```html
  <div class="dr-methodology" title="nflverse play-by-play data attributes drops to the intended target on any incomplete pass where the receiver had an opportunity to catch. This is broader than manually charted drops (e.g. PFF) which only count catchable balls that hit the receiver's hands.">
    drop data via nflverse PBP — includes all targetable incompletions (?)
  </div>
  ```
  However, the tooltip does NOT mention:
  - The <15 air yards threshold (the key filtering criterion)
  - Why drop rate + catch rate don't sum to 100%
  - That this is a custom heuristic, not an official nflverse field

**NOTE**: This ticket shares ID S1-021 with `tickets/backend/S1-021-puka-nacua-drop-rate-data-quality.md`. They cover different aspects (UI vs data quality) of the same issue.

## Expected

Add a methodology tooltip or info icon on the drops page explaining:
- "Drops are defined as incomplete, non-intercepted passes on throws < 15 air yards"
- "Drop Rate = drops / total targets (includes deep throws not counted as drops)"
- This is a proxy metric, not an official NFL stat

## Fix

1. Add info icon + tooltip to the "Drop Rate" column header in `frontend/drops.html`
2. Add a methodology chip or footer note (similar to tradevalues.html methodology chips)
3. Consider also showing "Drop Rate (short)" = drops / short-targets for a cleaner metric

## Scope

- 1 file: `frontend/drops.html` (UI tooltip/note)
- Optional: `adapters/nflverse_adapter.py` if adding short-target drop rate
