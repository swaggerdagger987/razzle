# QA + UX Audit — Phases 97-99

**Audit Date**: 2026-03-11
**Scope**: Phases 97-99 (Loading skeleton, Empty state, Search highlight)
**Files Audited**: frontend/lab.js, frontend/styles.css

---

## QA FINDINGS

### CRITICAL: None

### HIGH

1. **_setLoadingError msg not escaped** (`frontend/lab.js`)
   - Original: `msg` parameter inserted directly into innerHTML without escaping.
   - **Fixed in this audit**: Wrapped in `escapeHtml(msg)`.

### MEDIUM

2. **Search highlight using inline styles instead of CSS class** (`frontend/lab.js`)
   - Original: `<mark style="background:rgba(217,119,87,0.25)...">` hardcoded inline.
   - **Fixed in this audit**: Changed to `<mark class="search-hl">` with CSS rule in styles.css.

### LOW

3. Skeleton cache (`_skeletonHTML`) is set once and never invalidated. Current design is correct — skeleton structure is static and doesn't change with column visibility. Not a bug.
4. Empty state onclick handler uses inline `onclick="resetAllFilters()"`. Acceptable for a single hardcoded call to a known function.
5. Skeleton shimmer animation uses `background-position` — works in all modern browsers. No fix needed.

---

## UX FINDINGS

### CRITICAL: None
### HIGH: None
### MEDIUM: None

### LOW

1. Skeleton rows provide good loading feedback — 6 rows with varying widths feel organic.
2. Empty state tiger emoji and reset-filters link are clear and helpful.
3. Search highlight terracotta tint matches the accent color and is subtle enough to not distract.

---

## SUMMARY

- **CRITICAL**: 0
- **HIGH**: 1 (msg escaping — fixed)
- **MEDIUM**: 1 (inline styles → CSS class — fixed)
- **LOW**: 5

Overall: One XSS hardening fix and one style consistency fix. All phases 97-99 functional requirements met.
