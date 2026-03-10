# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 11 (QA + UX Audit — Auto-Generated Fixes for Phases 6-10)
- All tasks PENDING
- Stage: BUILD
- Next: Execute fix tasks

## Phase 11: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from Phases 6-10 QA+UX audit are resolved. Connection leak patched. XSS escaped. localStorage wrapped. Cold grays replaced with warm browns.

### Task 1: Fix CRITICAL — Connection leak in quick_search_players
**Requirement**: Wrap `quick_search_players()` in live_data.py (line 562-584) with try/finally to ensure `conn.close()` is always called. This function powers the Ctrl+K command palette and is called on every keystroke.
**Accept when**: Function has try/finally with conn.close(). No other code paths can leak the connection.
**Depends on**: none
**Size**: S
**Status**: PENDING
**Attempts**: 0
**Notes**:

### Task 2: Fix HIGH — XSS via unescaped err.message in lab.js
**Requirement**: Replace `${err.message}` with `${escapeHtml(err.message)}` in all 7 catch blocks in lab.js (lines 2518, 2538, 3275, 4187, 4430, 4805, 8036). Line 8476 already has the correct pattern.
**Accept when**: All err.message interpolations in innerHTML use escapeHtml(). No unescaped error messages remain.
**Depends on**: none
**Size**: S
**Status**: PENDING
**Attempts**: 0
**Notes**:

### Task 3: Fix HIGH — Unprotected localStorage in app.js theme functions
**Requirement**: Wrap localStorage calls in `initTheme()` (line 5) and `toggleTheme()` (lines 14, 17) in app.js with try-catch blocks. Phase 10 wrapped lab.js but missed app.js.
**Accept when**: initTheme and toggleTheme don't throw in private browsing. Theme still works normally.
**Depends on**: none
**Size**: S
**Status**: PENDING
**Attempts**: 0
**Notes**:

### Task 4: Fix HIGH — Cold gray #888 violates design rules
**Requirement**: Replace `#888` with `var(--ink-light)` in lab-panels.css at line 292 (`.tl-tier-label.F`) and line 417 (`.tv-rank.top2`). DESIGN.md forbids cold grays.
**Accept when**: No instances of #888 in lab-panels.css. Warm brown used instead.
**Depends on**: none
**Size**: S
**Status**: PENDING
**Attempts**: 0
**Notes**:

### Task 5: Fix MEDIUM findings (grouped)
**Requirement**: (1) Change badge `border: 1px solid` to `border: 2px solid` for ~16 badge classes in lab-panels.css (lines 559, 596, 797, 982, 1255, 1491, 1699, 1734, 1773, 1810, 1848, 1887, 2149, 2208, 2215, 2415). (2) Move `import re` to module level in live_data.py (add after line 8, remove inline imports at lines 2374 and 4553). (3) Optimize quick_search_players MAX(season) subquery with a CTE.
**Accept when**: Badge borders are 2px. `import re` is at module level only. quick_search uses CTE for MAX(season).
**Depends on**: Task 1 (quick_search already being modified)
**Size**: M
**Status**: PENDING
**Attempts**: 0
**Notes**:

---

## Phase 10: QA + UX Audit — Auto-Generated Fixes — COMPLETE
**Status**: All 5 tasks PASS

## Phase 9: Lab Sidebar Intelligence — COMPLETE
**Status**: All 5 tasks PASS

## Phase 8: QA + UX Audit for Phase 7 — COMPLETE
**Status**: All 3 tasks PASS

## Phase 7: Lab Polish — COMPLETE
**Status**: All 8 tasks PASS

## Phase 6: QA + UX Audit — Auto-Generated Fixes — COMPLETE
**Status**: All 6 tasks PASS

## Phase 5: College Football Integration — COMPLETE
**Status**: All 8 tasks PASS
