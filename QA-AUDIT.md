# QA + UX Audit — Phases 87-90

**Audit Date**: 2026-03-11
**Scope**: Phases 87-90 (Multi-sort, Sticky frozen columns, Reset all filters, Position breakdown badges)
**Files Audited**: frontend/lab.js, frontend/lab.html

---

## QA FINDINGS

### CRITICAL: None

### HIGH: None

### MEDIUM

1. **XSS in filter value rendering** (`frontend/lab.js`)
   - Original: Filter values from URL params rendered directly in HTML without escaping.
   - Attack vector: Crafted URL with `?filters=[{"key":"ppg","op":"eq","value":"<script>"}]`
   - **Fixed in this audit**: (a) Filter tag rendering now uses `escapeHtml()` for label, op, and value. (b) URL-loaded filters validated: must have string key, string op, numeric value. Non-numeric values stripped.

2. **Position badges only shown when 2+ positions present** (`frontend/lab.js`)
   - Original: `badges.length > 1` check suppressed badge when all visible players were same position.
   - **Fixed in this audit**: Changed to `badges.length` so single-position results still show breakdown.

### LOW

3. **Secondary sort header tint barely visible** (`frontend/lab.html`)
   - Original: 4% opacity background on secondary sort column header.
   - **Fixed in this audit**: Increased to 6% opacity for better visibility while still being subtler than primary sort (8%).

4. Summary bar tfoot colspan'd cell spans all utility columns — works correctly but no visual boundary between frozen and scrollable areas. Not a functional issue.

---

## UX FINDINGS

### CRITICAL: None

### HIGH: None

### MEDIUM: None

### LOW

1. Multi-sort △2/▽2 suffix is compact and discoverable. Good.
2. "Reset All ×" dark pill contrasts well against lighter filter tags — clear call to action.
3. Position breakdown badges use correct position colors (QB blue, RB teal, WR terracotta, TE purple).
4. Sticky columns scroll smoothly on desktop with proper background preservation.

---

## SUMMARY

- **CRITICAL**: 0
- **HIGH**: 0
- **MEDIUM**: 2 (both fixed — XSS filter escape + position badge guard)
- **LOW**: 4

Overall: One XSS vulnerability found and fixed (filter value rendering from URL params). Position badge display improved. Secondary sort visibility improved. All phases 87-90 functional requirements met.
