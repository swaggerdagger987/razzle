# FUNC-064: Frontend grade renderers miss B+ and C+ grades (FUNC-063 regression)

**Severity**: P1 — grades render with wrong colors, misleading users
**Flow**: 36 (Efficiency metrics), 62 (Dashboard/Stat Leaders)
**Regression from**: FUNC-063 fix (Ship Loop commits 3173125, ea2179e)
**Found**: Session 63

## Problem

Ship Loop fixed FUNC-063 by unifying all backend grade scales to 8-tier
(A+/A/B+/B/C+/C/D/F) via shared `_grade_from_percentile()`. But 5 frontend
renderers still use the old 6-tier gradeClass functions that don't handle
B+ or C+ grades.

## Affected Files

### 1. `frontend/efficiency.html` line 422-427
```js
function gradeClass(grade) {
    if (grade === 'A+') return 'grade-aplus';
    if (grade === 'A') return 'grade-a';
    if (grade === 'B') return 'grade-b';   // B+ falls through
    if (grade === 'C') return 'grade-c';   // C+ falls through
    if (grade === 'D') return 'grade-d';
    // returns undefined for B+ and C+ — badge gets no color class
}
```
**Result**: B+ and C+ badges have no styling (transparent/unstyled).
**Also missing**: CSS classes `grade-bplus` and `grade-cplus` (lines 229-234).

### 2. `frontend/consistency.html` line 422-427
Identical issue to efficiency.html. Same gradeClass function, same missing CSS.

### 3. `frontend/schedule.html` line 435-441
```js
function gradeClass(grade) {
    if (grade === 'A+') return 'grade-aplus';
    if (grade === 'A') return 'grade-a';
    if (grade === 'B') return 'grade-b';
    if (grade === 'C') return 'grade-c';
    if (grade === 'D') return 'grade-d';
    return 'grade-f';  // B+ and C+ fall through to RED
}
```
**Result**: B+ and C+ grades display in RED (grade-f) — makes above-average
players look like failures.

### 4. `frontend/stocks.html` line 440-446
Identical issue to schedule.html. B+ and C+ → grade-f (RED).

### 5. `frontend/lab-panels.js` line 8678-8681 (SOS panel)
```js
function gradeClass(grade) {
    if (grade === 'A+') return 'grade-aplus'; if (grade === 'A') return 'grade-a';
    if (grade === 'B') return 'grade-b'; if (grade === 'C') return 'grade-c';
    if (grade === 'D') return 'grade-d'; return 'grade-f';
}
```
**Result**: Same as schedule/stocks — B+ and C+ render as RED.

## What's NOT broken (already uses charAt(0) pattern)

- `lab-panels.js` efficiency panel (line 2235) — `grade.charAt(0)` ✅
- `lab-panels.js` consistency panel (line 2452) — `grade.charAt(0)` ✅
- `lab-panels.js` stock watch panel (line 1744) — `grade.charAt(0)` ✅
- `lab-panels.js` report card panel (line 6201) — explicit B+/C+ ✅
- `lab-panels.js` awards panel (line 6829) — explicit B+/C+ ✅
- `frontend/buysell.html` (line 553) — `grade.charAt(0)` ✅
- `frontend/reportcard.html` (line 457) — explicit B+/C+ ✅
- `frontend/awards.html` (line 491) — explicit B+/C+ ✅

## Data evidence

Direct Python call `fetch_stock_watch(season=2025, limit=50)` returns:
- B+ grades: 11 players (e.g., Davis Allen)
- C+ grades: 15 players (e.g., Cole Kmet, Ja'Tavion Sanders)

These players would show RED badges on stocks.html/schedule.html or
unstyled badges on efficiency.html/consistency.html.

## Fix

For each of the 5 broken renderers, use the `charAt(0)` pattern already
proven in the working renderers:

```js
function gradeClass(grade) {
    if (!grade) return 'grade-f';
    var g = grade.charAt(0);
    if (g === 'A') return grade === 'A+' ? 'grade-aplus' : 'grade-a';
    if (g === 'B') return 'grade-b';
    if (g === 'C') return 'grade-c';
    if (g === 'D') return 'grade-d';
    return 'grade-f';
}
```

No CSS changes needed — B+ maps to `grade-b` (blue) and C+ maps to
`grade-c` (yellow), which are the correct semantic colors.

## Visibility

All 4 standalone pages (efficiency, consistency, schedule, stocks) are
Pro-gated, so free users won't see the bug. But Pro users WILL see
wrong-colored grade badges. The SOS Lab panel is also Pro-gated.
