# QA + UX Audit — Phases 92-95

**Audit Date**: 2026-03-11
**Scope**: Phases 92-95 (Quick preset select, Visual mode cycle, Quick compare strip, Reddit table copy)
**Files Audited**: frontend/lab.js, frontend/lab.html

---

## QA FINDINGS

### CRITICAL: None

### HIGH

1. **Pipe character escaping in Reddit table** (`frontend/lab.js`)
   - Original: Player names/values with pipe chars would corrupt markdown table formatting.
   - **Fixed in this audit**: Added `escPipe()` helper to escape `|` chars in all table cell values.

### MEDIUM

2. **Quick compare stats not universe-aware** (`frontend/lab.js`)
   - Original: Hardcoded NFL stats (ppg, fantasy_points_ppr) that don't exist in college data.
   - **Fixed in this audit**: Stats array now checks `state.universe === "college"` and uses college-appropriate stats (total_yards, total_tds, rec_yards, etc.).

3. **Visual mode cycle fires in college mode** (`frontend/lab.js`)
   - Original: V key cycles visual modes even when heat/percentile buttons are hidden in college mode, causing state/UI desync.
   - **Fixed in this audit**: Added guard `if (state.universe !== "nfl") return` with toast feedback.

### LOW

4. Quick compare strip lacks aria-label for screen readers. Not a functional issue.
5. Reddit table copy fallback toast doesn't include row count (minor inconsistency).

---

## UX FINDINGS

### CRITICAL: None
### HIGH: None
### MEDIUM: None

### LOW

1. Preset select works correctly in all universes (NFL/College/Prospect) — populates with appropriate presets.
2. Quick compare strip green highlighting is clear and position colors are accurate.
3. Reddit table button styled with orange border — matches export action theme.

---

## SUMMARY

- **CRITICAL**: 0
- **HIGH**: 1 (pipe escaping — fixed)
- **MEDIUM**: 2 (college stats + visual mode guard — both fixed)
- **LOW**: 4

Overall: One data corruption bug (pipe chars in Reddit table) and two college-mode issues found and fixed. All phases 92-95 functional requirements met.
