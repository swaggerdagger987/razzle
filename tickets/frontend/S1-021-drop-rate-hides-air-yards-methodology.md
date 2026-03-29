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

- `frontend/drops.html` — No tooltip, methodology note, or info icon explaining:
  - What constitutes a "drop" vs general incompletion
  - The <15 air yards threshold
  - Why drop rate + catch rate don't sum to 100%

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
