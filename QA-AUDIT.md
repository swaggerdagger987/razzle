# QA + UX Audit — Phases 71-75

**Audit Date**: 2026-03-11
**Scope**: Phases 71-75 (QA fixes 66-70, double-click filter, copy to clipboard, inline data bars, percentile display mode)
**Files Audited**: frontend/lab.js, frontend/lab.html

---

## QA FINDINGS

### CRITICAL: None

### HIGH: None

### MEDIUM

1. **Copy to clipboard lacks textarea fallback** (`frontend/lab.js`, `copyTableToClipboard`)
   - The function uses `navigator.clipboard.writeText()` which requires HTTPS. If clipboard API is unavailable (HTTP localhost, older browsers), it falls to try/catch with a toast error.
   - **Fix**: Add the existing `_fallbackCopy()` pattern (textarea fallback) as a secondary approach, like `sharePanelURL` already does.

### LOW

2. `.pctl-val` class has no CSS rules — semantic class with no stylesheet rule. All styling is inline. Not a bug.
3. Percentile mode R shortcut works in college mode (button hidden). Harmless — computePercentiles() handles sparse data. Same pattern as heat colors.
4. Double-click column header fires sort + filter. Standard browser behavior, harmless.

---

## UX FINDINGS

### CRITICAL: None

### HIGH: None

### MEDIUM

1. **Toolbar has 7 visualization toggles** (Heat, Pctl, Bars, Tiers, Dense, Groups, Summary). Dense for first-time users but acceptable for power-user audience. No action needed.

### LOW

2. "Pctl" button abbreviation may not be obvious. Tooltip explains it. Consistent with other labels.
3. Percentile mode + Heat colors show overlapping percentile info. Both useful together — number + color.
4. Copy to clipboard always exports raw values (not percentiles). Correct behavior.

---

## SUMMARY

- **CRITICAL**: 0
- **HIGH**: 0
- **MEDIUM**: 2 (1 QA actionable, 1 UX no action needed)
- **LOW**: 6

Overall: Clean. One fix needed (clipboard fallback).
