# QA + UX Audit — Phases 56-60

**Scope**: Phases 56-60 (Density Toggle, Column Group Headers, Stats Summary Bar, Row Highlighting, Context Menu)
**Files reviewed**: frontend/lab.js, frontend/lab.html

---

## QA FINDINGS

### HIGH-1: Context menu XSS/crash with apostrophe names
**File**: frontend/lab.js (context menu builder, ~line 1700-1730)
**Issue**: `escapeAttr()` converts `'` to `&#39;`, but when used in `onclick` attribute strings like `onclick="fn('O&#39;Brien')"`, the browser HTML-decodes first (giving `fn('O'Brien')`) then executes as JS — breaking the string literal. Affects players like D'Andre Swift, Ja'Marr Chase.
**Fix**: Use a JS-safe escape function for values embedded in onclick handlers, or switch to data attributes + event delegation.

### HIGH-2: navigator.clipboard.writeText without error handling
**File**: frontend/lab.js (context menu "Copy Name" action)
**Issue**: `navigator.clipboard.writeText()` can throw if: (a) page is served over HTTP (not HTTPS), (b) clipboard permission denied, (c) focus is lost. No try/catch wrapping — will show uncaught promise rejection.
**Fix**: Wrap in try/catch or use a fallback (toast with "copy failed").

### HIGH-3: Context menu separator missing in college mode
**File**: frontend/lab.js (context menu builder)
**Issue**: The separator (`{ sep: true }`) is inside the `if (state.universe === "nfl")` block, so college/prospect mode has no visual break between Watchlist and Toggle Highlight.
**Fix**: Move separator outside the NFL conditional or add one unconditionally before utility actions.

---

## UX FINDINGS

### MEDIUM-U1: Summary bar shows "avg" without scope context
**Issue**: The summary bar shows "avg" label for each column but doesn't indicate it's the average of the currently displayed page (up to 100 rows), not the full dataset.
**Fix**: Change label to "page avg" or add tooltip explaining scope.

### MEDIUM-U2: No way to clear all row highlights
**Issue**: Users can highlight rows by clicking but there's no shortcut to clear all highlights at once.
**Fix**: Add Escape key or context menu option to clear all highlights.

### LOW-U1: "A" shortcut for Summary bar not mnemonic
**Issue**: "A" doesn't intuitively map to "Summary". Already documented in shortcut reference.

### LOW-U2: Row highlights lost on data refresh
**Issue**: Expected behavior but may surprise users. Low priority.

### LOW-U3: Five display toggle buttons may feel cluttered
**Issue**: Heat, Tiers, Dense, Groups, Summary — five consecutive toggle buttons. Toolbar has 15+ visible buttons total.
