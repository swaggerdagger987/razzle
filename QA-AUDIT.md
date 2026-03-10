# QA + UX Audit — Phases 16-19

**Date**: 2026-03-10
**Scope**: Phase 16 (Rename), Phase 17 (Data Expansion), Phase 18 (Prospects Merge), Phase 19 (Draft Class Tracker)

---

## QA FINDINGS

### HIGH — Variable shadowing in applyUniverseUI()
- **File**: frontend/lab.js:1098
- **Issue**: `const isProspect = isProspectView()` creates a local variable that could be confused with the helper function. While not technically broken (the function is called, result stored), it's a maintenance trap.
- **Fix**: Rename to `const prospectMode = isProspectView()` and update all references within the function.

### HIGH — Duplicate year calculation in try/catch
- **File**: frontend/lab.js:552-553, 569
- **Issue**: Year fallback logic is computed independently in both try and catch blocks. The catch block uses a different variable name (`_fb` vs `_nflYear`).
- **Fix**: Move year calculation before try/catch block so both paths use the same value.

### MEDIUM — Wrong state variable for prospect page title
- **File**: frontend/lab.js:1662
- **Issue**: `generateRedditTitle()` uses `state.season` for prospect view but should use `state.draftYear`. Results in title showing "0 Draft Prospect Rankings" instead of the actual draft year.
- **Fix**: Change `state.season` to `state.draftYear` on line 1662.

### LOW — No validation on `cv` URL parameter
- **File**: frontend/lab.js:1557
- **Issue**: `state.collegeView = params.get("cv")` accepts any string. Invalid values like `?cv=foo` would silently set collegeView to an unknown value.
- **Fix**: Validate that cv is either "stats" or "prospects" before assigning.

### LOW — URL construction in Draft Class Tracker panel
- **File**: frontend/lab-panels.js:8957
- **Issue**: URL built with string concatenation + leading `&` replacement. Works but could leave trailing `?` when no params.
- **Fix**: No action needed — functional as-is.

---

## UX FINDINGS

### MEDIUM — College sub-toggle discoverability
- **Issue**: Users switching to College mode now see "Season Stats" and "Draft Prospects" sub-toggles. This adds one extra step compared to the old dedicated Prospects button. The sub-toggle is visually smaller than the universe buttons and could be missed.
- **Fix**: No action needed — the sub-toggle is visible and clearly labeled. The reduction from 3 to 2 universe buttons actually simplifies the top-level choice.

### LOW — Draft Class Tracker "reviewing the tape..." loading message
- **Issue**: The loading message uses "reviewing the tape..." which is creative but less obvious than other Lab panels' loading messages.
- **Fix**: No action needed — consistent with the playful copy style.

### LOW — All 37+ standalone pages work with dynamic seasons
- Verified that all standalone pages pull available_seasons from API. No hardcoded season values block the 2015-2025 expansion.

---

## SUMMARY

| Severity | Count | Action |
|----------|-------|--------|
| CRITICAL | 0 | — |
| HIGH | 2 | Fix |
| MEDIUM | 2 | Fix (1 QA, 1 UX logged only) |
| LOW | 3 | Logged |

No CRITICAL findings. 2 HIGH and 1 MEDIUM fixes required.
