# Razzle Loop — Phase 86 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 81-85)

**Current Phase**: 86 — QA + UX Audit Fixes
**Exit Criterion**: All HIGH findings from QA-AUDIT.md (Phases 81-85) resolved. SOS endpoint uses `full_name` instead of `display_name`. SOS endpoint includes `fantasy_relevant = 1` filter. MEDIUM fixes applied: efficiency YAC/Rec clamped to non-negative, consistency uses sample variance (Bessel's correction), efficiency column header renamed, consistency CoV displayed as percentage. All fixes verified with syntax checks.

---

## Task 1: HIGH fixes — SOS backend data issues
**Status**: PASS
**Attempts**: 1
**Notes**: Changed `p.display_name` to `p.full_name` on line 6593. Added `AND p.fantasy_relevant = 1` on line 6600. Python syntax valid.

## Task 2: MEDIUM fixes — Backend computation corrections
**Status**: PASS
**Attempts**: 1
**Notes**: Efficiency YAC/Rec clamped with `max(0, ...)` on line 6286. Consistency variance uses `/ (n - 1)` (Bessel's correction) on line 6442. Python syntax valid.

## Task 3: MEDIUM fixes — Frontend label/display improvements
**Status**: PASS
**Attempts**: 1
**Notes**: Efficiency "Y/Tch" renamed to "YPT" in both EFF_COLUMNS and VOL_COLUMNS. Consistency CoV display changed from `fmt(p.cov, 3)` to `fmt(p.cov * 100, 1) + '%'`, column label "CoV" → "CoV%", tooltips updated. JS structure valid (134/134 braces, 292/292 and 286/286 parens).

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py + live_data.py). JS structure valid in efficiency.html and consistency.html. All HIGH fixes confirmed: full_name on line 6593, fantasy_relevant on line 6600. All MEDIUM fixes confirmed: max(0,...) on line 6286, (n-1) on line 6442, YPT labels, CoV% display.

---

## Loop State
```
Current Phase: 86
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
