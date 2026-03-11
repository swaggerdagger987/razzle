# QA + UX Audit — Phases 126-130

**Date**: 2026-03-11
**Phases audited**: 126 (Pin Diff Mode), 127 (Filter Indicators), 128 (Bulk Pin), 129 (Age Badges), 130 (QA+UX Audit)

## QA FINDINGS

### CRITICAL

1. **Missing CSS variable `--font-data`** — `lab.js:4044` and `lab.html:477` used `var(--font-data)` which does not exist. Only `--font-display`, `--font-mono`, `--font-hand` are defined.
   - **FIX APPLIED**: Replaced with `var(--font-mono)`.

### HIGH

2. **Diff baseline cache stale on data refresh** — `lab.js:4022-4030` cached diff baseline only by player ID, not invalidating when `state.items` changes.
   - **FIX APPLIED**: Added `state.items.length` to cache key.

### MEDIUM

3. **Diff banner name fallback** — `baseline.full_name || baseline.player_name` had no final fallback.
   - **FIX APPLIED**: Added `|| "Unknown"` fallback.

4. **Quick-filter on tiny datasets** — `_applyQuickFilter()` creates "Top 10" filter even with fewer than 10 items. Low impact, filter still works.

5. **Age badges in compact density mode** — Age badges add visual clutter in compact mode. Consider hiding in density mode.

### LOW

6. **Age badge CSS in lab.html** — Style separation could be cleaner but follows existing pattern.

## UX FINDINGS

### First 30 Seconds Test — PASS
- Lab loads with data, filters work, new features enhance exploration.
- Age badges add visual interest for dynasty users.

### Readability — PASS
- All new labels clear and intuitive.

### Flow Tests — PASS
- All 3 core journeys work without regressions.

### Visual Noise — MEDIUM
- Age badges add density in compact mode. Addressed in fix tasks.

## FIXES APPLIED
- CRITICAL #1: `--font-data` → `--font-mono`
- HIGH #2: Diff cache key includes items.length
- MEDIUM #3: Diff banner name fallback

## REMAINING TASKS
- MEDIUM #5: Hide age badges in compact density mode
