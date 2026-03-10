# QA + UX Audit — Phases 20-24

**Date**: 2026-03-10
**Scope**: Phase 20 (QA fixes), Phase 21 (Turso migration), Phase 22 (Correlations), Phase 23 (Power Rankings), Phase 24 (Game Script)

---

## QA FINDINGS

### QA-1: HIGH — Missing 'powerrankings' in NFL_ONLY_PANELS
- **File**: frontend/lab.js, line 1174
- **Issue**: The `powerrankings` panel has `showNflOnlyMsg()` in lab-panels.js but is NOT listed in the `NFL_ONLY_PANELS` array. When a user switches to College mode, the Power Rankings sidebar item does not dim, misleading users into clicking it.
- **Fix**: Add `'powerrankings'` to the NFL_ONLY_PANELS array.

### QA-2: HIGH — Missing try-except on /api/stat-correlations endpoint
- **File**: backend/server.py, line 2017-2024
- **Issue**: The stat-correlations endpoint has no try-except wrapper, unlike dynasty-power-rankings and game-script. Unhandled exceptions return raw 500 HTML instead of JSON error response.
- **Fix**: Wrap in try-except returning `JSONResponse({"error": "..."}, status_code=500)`.

### QA-3: MEDIUM — Missing encodeURIComponent on correlations x_stat/y_stat
- **File**: frontend/lab-panels.js, correlations panel
- **Issue**: When clicking a heat map cell, x_stat and y_stat are appended to the URL without `encodeURIComponent()`.
- **Fix**: Wrap in `encodeURIComponent()`.

### QA-4: MEDIUM — Missing encodeURIComponent on draft tracker position param
- **File**: frontend/lab-panels.js, drafttracker panel
- **Issue**: Position parameter in draft tracker API call is not URL-encoded.
- **Fix**: Wrap in `encodeURIComponent()`.

### QA-5: LOW — POS_COLS constant redefined locally in multiple panels
- **File**: frontend/lab-panels.js
- **Issue**: Position color map defined locally in powerrankings and gamescript panels (code duplication).

---

## UX FINDINGS

### UX-1: HIGH — Abbreviations lack tooltips in new panels
- **Panels**: Game Script (GT%, Avg Diff), Correlations (r, Tgt, Rec), Draft Class Tracker (FPTS, AV)
- **Issue**: Fantasy abbreviations have no hover tooltips. Users from r/DynastyFF may not know what GT% or AV means.
- **Fix**: Add `title` attributes to table headers with full descriptions.

### UX-2: MEDIUM — Game Script table mobile responsiveness
- **Issue**: The `.gs-table` uses custom CSS. On small screens (480px), the two-column grid may cause issues.
- **Fix**: Add `overflow-x: auto` wrapper around each `.gs-table`.

### UX-3: LOW — Loading messages inconsistent across panels
- **Issue**: Different panels use different loading flavor text. Variety is arguably brand personality.

### UX-4: LOW — Sidebar collapsed icons not all intuitive
- **Issue**: Some sidebar icons are abstract Unicode. Tooltips provide clarity on hover.

---

## SUMMARY

| ID | Severity | Type | Description |
|----|----------|------|-------------|
| QA-1 | HIGH | Logic | powerrankings missing from NFL_ONLY_PANELS |
| QA-2 | HIGH | Error handling | stat-correlations endpoint missing try-except |
| QA-3 | MEDIUM | URL encoding | correlations x_stat/y_stat not encoded |
| QA-4 | MEDIUM | URL encoding | draft tracker position not encoded |
| QA-5 | LOW | Code quality | POS_COLS duplicated across panels |
| UX-1 | HIGH | Readability | Abbreviations lack tooltips in new panels |
| UX-2 | MEDIUM | Mobile | Game Script table needs overflow wrapper |
| UX-3 | LOW | Branding | Loading messages inconsistent |
| UX-4 | LOW | Visual | Sidebar icons abstract |

No CRITICAL findings. 3 HIGH and 3 MEDIUM fixes required. LOW items logged but not tasked.
