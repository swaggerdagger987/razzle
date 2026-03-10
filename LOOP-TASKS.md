# Razzle Loop — Phase 61 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 56-60)

**Current Phase**: 61 — QA + UX Audit Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from QA + UX audit of phases 56-60 are resolved. XSS vulnerabilities patched. UI explainers added for boom/bust grade and histogram legend. Roster Value grade/status explained. Input validation hardened.

---

## Task 1: XSS patches in renderPlayerComps and loadPlayerComps
**Status**: PENDING
**Acceptance**: All 6 unescaped `comp.full_name` / `player.full_name` locations in renderPlayerComps wrapped with `escapeHtml()`. Error message in loadPlayerComps escaped. Verified via grep that no unescaped player name interpolations remain in comp-related functions.
**Attempts**: 0
**Notes**: QA-1, QA-2

## Task 2: Boom/Bust histogram legend + grade explanation
**Status**: PENDING
**Acceptance**: Histogram has a legend box below or beside it showing: green square = Boom week, red square = Bust week, position-colored square = Normal. Grade badge has subtitle text: "Consistency Grade" or similar. Legend also includes boom/bust threshold values for redundancy with the Caveat annotation.
**Attempts**: 0
**Notes**: UX-1, UX-2, UX-6

## Task 3: Roster Value grade and status explainers
**Status**: PENDING
**Acceptance**: Roster Value grade badge has a brief explainer or tooltip showing grading criteria. Status badge (COMPETING/RETOOLING/REBUILDING) has tooltip or subtitle explaining the logic.
**Attempts**: 0
**Notes**: UX-3

## Task 4: Backend hardening — limit validation + dead import
**Status**: PENDING
**Acceptance**: /api/players/{id}/comps limit parameter validated with `max(1, min(limit, 10))`. Redundant `import math` inside `_pick_value()` removed. py_compile passes.
**Attempts**: 0
**Notes**: QA-3, QA-4

## Task 5: Medium fixes — design borders + consistency score + comp annotation
**Status**: PENDING
**Acceptance**: Boom/bust stat cards use `border:3px solid var(--ink)` and `box-shadow:4px 4px 0 var(--ink)`. Consistency score (0-100) displayed in stat cards row. Player Comps section has Caveat annotation explaining similarity methodology. All syntax clean.
**Attempts**: 0
**Notes**: QA-5, UX-4, UX-5

---

## Loop State
```
Current Phase: 61
Current Task: 1
Current Stage: BUILD
Attempt: 1
Tasks Completed: 0/5
```
