# Razzle Loop — Phase 86 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 81-85)

**Current Phase**: 86 — QA + UX Audit Fixes
**Exit Criterion**: All HIGH findings from QA-AUDIT.md (Phases 81-85) resolved. SOS endpoint uses `full_name` instead of `display_name`. SOS endpoint includes `fantasy_relevant = 1` filter. MEDIUM fixes applied: efficiency YAC/Rec clamped to non-negative, consistency uses sample variance (Bessel's correction), efficiency column header "Y/Tch" renamed to "YPT", consistency CoV displayed as percentage. All fixes verified with syntax checks.

---

## Task 1: HIGH fixes — SOS backend data issues
**Status**: PENDING
**Attempts**: 0
**Acceptance Criteria**:
- `fetch_strength_of_schedule` in live_data.py uses `p.full_name` instead of `p.display_name`
- `fetch_strength_of_schedule` player query includes `AND p.fantasy_relevant = 1`
- Python syntax valid after changes

## Task 2: MEDIUM fixes — Backend computation corrections
**Status**: PENDING
**Attempts**: 0
**Acceptance Criteria**:
- Efficiency `yac_per_rec` clamped to `max(0, ...)` to prevent negative display values
- Consistency variance uses `/ (n - 1)` instead of `/ n` (Bessel's correction for sample variance)
- Python syntax valid after changes

## Task 3: MEDIUM fixes — Frontend label/display improvements
**Status**: PENDING
**Attempts**: 0
**Acceptance Criteria**:
- Efficiency column header "Y/Tch" renamed to "YPT" in both EFF_COLUMNS and VOL_COLUMNS
- Consistency CoV displayed as percentage (value * 100, 1 decimal, "%" suffix) instead of raw decimal
- JS syntax valid after changes (balanced braces/parens)

## Task 4: Smoke test + verification
**Status**: PENDING
**Attempts**: 0
**Acceptance Criteria**:
- Python syntax valid (server.py, live_data.py)
- JS structure valid in all modified HTML files
- All HIGH fixes confirmed via code inspection
- All MEDIUM fixes confirmed via code inspection

---

## Loop State
```
Current Phase: 86
Current Task: 1
Current Stage: PENDING
Attempt: 0
Tasks Completed: 0/4
```
