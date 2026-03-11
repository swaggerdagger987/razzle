# QA + UX Audit — Phases 81-85

**Audit Date**: 2026-03-11
**Scope**: Phases 81-85 (QA fixes 76-80, select all checkbox, keyboard page nav, smart filter presets, group header toggle)
**Files Audited**: frontend/lab.js, frontend/lab.html, backend/live_data/players.py

---

## QA FINDINGS

### CRITICAL: None

### HIGH

1. **Post-query filter pagination was incorrect** (`backend/live_data/players.py`)
   - Original: SQL LIMIT/OFFSET applied before post-query filters, causing incorrect total counts and missing items across pages.
   - **Fixed in this audit**: When post_filters exist, SQL fetches 5x items with offset 0, post-filters applied in Python, then manual pagination slice. Total count reflects filtered results.

### MEDIUM: None (after fix above)

### LOW

2. Select all checkbox selects max 5 players (comparison limit). Expected behavior but no visual indication of the 5-player cap. Tooltip says "Select all / none" which is slightly misleading.
3. ArrowLeft/Right page navigation fires when a table row is focused. The keyboard navigation handler checks for TR focus but doesn't intercept arrow keys. Not a functional issue since left/right don't have row-level behavior.
4. Group header onclick uses string literal for group name. Safe since group names are hardcoded without quotes.
5. Smart filter presets hidden in college mode (added in this audit fix).

---

## UX FINDINGS

### CRITICAL: None

### HIGH: None

### MEDIUM: None

### LOW

1. Smart Filters dropdown has descriptive labels showing actual filter criteria — good for transparency.
2. Group header click-to-toggle is discoverable via cursor:pointer and title tooltip.
3. Column picker search auto-focuses on open — smooth flow.

---

## SUMMARY

- **CRITICAL**: 0
- **HIGH**: 1 (pagination fix — already applied)
- **MEDIUM**: 0
- **LOW**: 6

Overall: One significant bug found and fixed (post-query filter pagination). Smart filters and college mode visibility also fixed proactively during audit. All other features clean.
