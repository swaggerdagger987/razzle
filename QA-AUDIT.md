# QA + UX Audit — Phases 101-104

**Audit Date**: 2026-03-11
**Scope**: Phases 101-104 (Row expand, Filter badge, Column quick-hide, Data freshness)
**Files Audited**: frontend/lab.js, frontend/lab.html

---

## QA FINDINGS

### CRITICAL

1. **XSS in weekly expand data rendering** (`frontend/lab.js`)
   - Original: Numeric fields from API (week, passing_yards, etc.) concatenated directly into innerHTML without escaping.
   - **Fixed in this audit**: Added `_n()` numeric sanitizer (parseInt, NaN→0) for all stat fields. Week and opponent wrapped in `escapeHtml()`.

### HIGH

2. **_expandedRows never cleared on re-render** (`frontend/lab.js`)
   - Original: Stale player IDs accumulated in `_expandedRows` across page changes.
   - **Fixed in this audit**: `_expandedRows = {}` at top of `renderTableBody()`.

3. **Expand row colspan wrong for non-NFL modes** (`frontend/lab.js`)
   - Original: Hardcoded `cols.length + 5` didn't account for missing pin column in college/prospect modes or the add-column button.
   - **Fixed in this audit**: Dynamic calculation: `cols.length + (nfl ? 5 : 4) + 1`.

4. **Freshness title not escaped** (`frontend/lab.js`)
   - Original: `toLocaleTimeString()` inserted directly into title attribute.
   - **Fixed in this audit**: Wrapped in `escapeAttr()`.

### MEDIUM

5. Column header context menu extracts key via regex parsing of onclick attribute. Fragile but functional. Not fixed — would require data-attribute refactor of renderTableHead.
6. Filter badge doesn't count search or position filter. Intentional — badge shows explicitly added filters, not implicit state. Position and search are visible in their own UI controls.

### LOW

7. Freshness timer shows stale "ago" text until next action triggers updateResultCount(). Acceptable — real-time timer would add complexity for minimal gain.
8. Expand fetch not cancelled on collapse — wasted bandwidth. Minor.

---

## UX FINDINGS

### CRITICAL: None
### HIGH: None
### MEDIUM: None
### LOW

1. Row expand arrow is subtle but discoverable via rank column tooltip.
2. Filter badge orange pill matches accent color.
3. Column right-click menu provides expected spreadsheet-like interaction.

---

## SUMMARY

- **CRITICAL**: 1 (XSS in expand data — fixed)
- **HIGH**: 3 (memory leak, colspan, title escaping — all fixed)
- **MEDIUM**: 2 (not fixed, acceptable)
- **LOW**: 3

Overall: One XSS vulnerability, one memory leak, and two rendering bugs found and fixed. All phases 101-104 functional requirements met.
