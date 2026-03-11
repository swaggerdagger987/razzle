# QA + UX Audit — Phases 66-70

**Date**: 2026-03-11
**Scope**: Phases 67-70 (Sort column highlight, Row rank, Rows per page, PNG export enhancement, Scroll-to-top + header shadow)
**Files**: frontend/lab.html, frontend/lab.js

## QA FINDINGS

### CRITICAL: None

### HIGH: None

### MEDIUM

1. **ColCount mismatch in renderVisibleRows and renderPinnedRows**
   - File: frontend/lab.js, colCount calculations in renderVisibleRows spacer and renderPinnedRows separator
   - Issue: colCount calculation uses `+ 4 +` but should be `+ 5 +` to account for rank column added in Phase 67. insertTierBreakRows was correctly updated but these two were missed.
   - Impact: Spacer rows may have wrong colspan causing slight horizontal misalignment.
   - Fix: Change `+ 4 +` to `+ 5 +` in both locations.

2. **Page size selector default `selected` attribute hardcoded to 100**
   - File: frontend/lab.html, pageSizeSelect option element
   - Issue: `<option value="100" selected>` always shows 100 selected on initial HTML parse even if localStorage has 50. Only syncs after first fetch completes.
   - Impact: Cosmetic — wrong value shown for ~1 second on load.
   - Fix: Remove `selected` attribute, let renderPagination() handle it on first call.

### LOW

3. **Header shadow uses rgba(0,0,0) instead of espresso brown** — should be rgba(45,31,20,0.08)
4. **Scroll-to-top button uses border-radius: 50%** — not matching chunky aesthetic, should use border-radius: 8px
5. **Scroll-to-top button missing aria-label** — has title but not aria-label
6. **Scroll threshold 200px is a magic number** — minor, works fine
7. **Scroll-to-top onclick inline lacks null check** — minor defensive coding

## UX FINDINGS

### CRITICAL: None

### HIGH: None

### MEDIUM: None

### LOW

1. **Rank column on narrow screens** — 36px rank column adds width; on mobile the table already horizontally scrolls so no functional issue.
2. **Page size dropdown label** — dropdown has title="Rows per page" but no visible label; minor discoverability issue.
