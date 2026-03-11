# QA + UX Audit — Phases 76-80

**Audit Date**: 2026-03-11
**Scope**: Phases 76-80 (QA fixes 71-75, row position stripe, zebra striping, column picker search, cell double-click copy)
**Files Audited**: frontend/lab.js, frontend/lab.html

---

## QA FINDINGS

### CRITICAL: None

### HIGH: None

### MEDIUM

1. **Column picker search input doesn't auto-focus** (`frontend/lab.js`, `openColumnPicker`)
   - The search input exists but isn't focused when the picker opens. Users must click it before typing.
   - **Fix**: Add `searchInput.focus()` after clearing the value in `openColumnPicker()`.

### LOW

2. Column picker search uses `style*="display: none"` selector for group hide logic. Works reliably since we control how `style.display` is set. No action needed.
3. Double-click on stat cell fires click handler first (row highlight toggles twice = no net change), then dblclick copies. Behavior is correct — double-click = copy only.
4. Pinned rows don't get zebra striping (rowIdx=null). Correct behavior — pinned rows have their own styling.
5. Non-fantasy positions (K, DEF) get faint position stripe color. Correct since those aren't the focus.

---

## UX FINDINGS

### CRITICAL: None

### HIGH: None

### MEDIUM: None

### LOW

1. In percentile mode, double-click copies "92%" including the % character. Correct behavior — copies what's displayed.
2. Position stripe is subtle and clean. No visual clutter added.
3. Zebra striping at 2.5% opacity is properly subtle — doesn't compete with heat colors or data bars.

---

## SUMMARY

- **CRITICAL**: 0
- **HIGH**: 0
- **MEDIUM**: 1 (column picker search auto-focus)
- **LOW**: 6

Overall: Very clean. One actionable fix (auto-focus search).
