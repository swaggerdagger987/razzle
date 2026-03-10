# QA + UX Audit — Phases 66-70

**Date**: 2026-03-10
**Scope**: All files changed in Phases 66 (QA Fixes), 67 (Prospects), 68 (Scarcity), 69 (Breakouts), 70 (Buy/Sell)

---

## QA FINDINGS

### CRITICAL

**(none)**

### HIGH

**QA-H1: Connection leak in `fetch_prospect_scores` — no try/finally**
- File: `backend/live_data.py`, lines ~1914-2035
- `fetch_prospect_scores` does NOT use try/finally. If an exception occurs during percentile computation or sorting, the SQLite connection leaks. All three newer functions (scarcity, breakouts, buy/sell) correctly use try/finally.
- Fix: Wrap function body in try/finally with conn.close() in finally block.

**QA-H2: Unescaped numeric API values in innerHTML (breakouts, buysell, scarcity)**
- Files: `frontend/breakouts.html` (lines 513, 527, 535-540, 552-558), `frontend/buysell.html` (lines 508-526, 543, 566), `frontend/scarcity.html` (lines 458-464)
- Numeric values from API responses (rank, scores, percentages, efficiency stats) are injected directly into innerHTML without escapeHtml(). While these should be numeric, a malformed API response could inject HTML.
- Fix: Wrap all API values in escapeHtml() or coerce to Number before injection. For CSS width values, use parseFloat().

**QA-H3: Nav uses `main-nav` class — not matching styles.css `topnav` class**
- Files: `frontend/scarcity.html`, `frontend/breakouts.html`, `frontend/buysell.html`
- These three pages use `class="main-nav"` but styles.css defines `.topnav`. Navigation bar is unstyled/inconsistently styled on these pages.
- Fix: Change `main-nav` to `topnav` and align nav HTML structure with the rest of the site.

### MEDIUM

**QA-M1: Unbounded SQL queries in breakout and buy/sell functions**
- File: `backend/live_data.py`, lines ~4444-4467 (breakout), ~4675-4702 (buy/sell)
- Main queries fetch ALL qualifying players from DB before Python-side truncation. No SQL LIMIT as safety cap.
- Fix: Add `LIMIT 500` to SQL queries as safety cap.

**QA-M2: Position input not validated in `fetch_prospect_scores`**
- File: `backend/server.py`, line ~508
- `/api/prospect-scores` passes position without whitelist validation, unlike other endpoints.
- Fix: Add position whitelist check.

**QA-M3: Missing accessibility labels on season selects**
- Files: scarcity.html, breakouts.html, buysell.html
- Season `<select>` elements have `title="Season"` but no `aria-label` for screen readers.
- Fix: Add `aria-label="Season"` to each select.

**QA-M4: Inconsistent html2canvas CDN source and loading strategy**
- prospects.html lazy-loads from cdnjs.cloudflare.com; other pages eagerly load from html2canvas.hertzen.com
- Fix: Standardize on lazy-load pattern with consistent CDN.

### LOW

**QA-L1: 1px borders on bar track elements**
- Files: prospects.html, scarcity.html, breakouts.html, buysell.html
- Bar track containers use `1px solid` borders. DESIGN.md says no thin 1px borders on primary elements.
- Fix: Change to 2px or remove border.

**QA-L2: Inconsistent row access patterns (index vs dict) in live_data.py**
- `fetch_prospect_scores` uses dict-style row access; newer functions use fragile index-based access.
- Fix: Low priority — consider refactoring newer functions to dict-style for resilience.

---

## UX FINDINGS

### CRITICAL

**UX-C1: Prospects click navigates by player NAME to Lab search, not by player ID**
- File: `frontend/prospects.html`
- Clicking a prospect card navigates to `/lab.html?mode=prospects&search={name}` instead of `/player/{id}` like every other page. Name-based search is fragile (duplicate names, special characters, partial matches). Users experience a jarring context switch from card UI to spreadsheet view.
- Fix: Navigate to `/player/{id}` like other pages, or create a prospect profile view.

### HIGH

**UX-H1: "RBS" score has zero explanation on Breakouts page**
- File: `frontend/breakouts.html`
- "RBS" appears on every card but "Razzle Breakout Score" is never spelled out anywhere on the page.
- Fix: Add tooltip on RBS label: "Razzle Breakout Score — measures opportunity vs production gap"

**UX-H2: "RPS" score lacks tooltip on Prospects page**
- File: `frontend/prospects.html`
- "RPS" appears on every card; methodology text is small and easily missed in header.
- Fix: Add tooltip on RPS label explaining the scoring methodology.

**UX-H3: Scarcity summary drop-off numbers shown without units**
- File: `frontend/scarcity.html`
- The summary cards show raw drop-off values (e.g., "12.4") with no units. Middle positions both labeled just "drop-off" with no differentiation.
- Fix: Add "PPG" unit label. Give middle cards ranked labels like "2nd most scarce".

**UX-H4: Age badge thresholds inconsistent across pages**
- Breakouts: young (<=24), prime (25-26), aging (27+)
- Buy/Sell: young (<=24), prime (25-27), aging (28-30), veteran (31+)
- A 27-year-old shows as "aging" on Breakouts but "prime" on Buy/Sell.
- Fix: Standardize age thresholds across all pages.

**UX-H5: No explanation of how Breakouts vs Buy/Sell differ**
- Users can't self-select the right tool. Both show player cards with scores and stats. The conceptual difference (opportunity gap vs efficiency mismatch) isn't clearly communicated.
- Fix: Add a brief one-line distinction on each page subtitle.

**UX-H6: Nav styling differs between Prospects and other new pages**
- Prospects uses `topnav` with tiger emoji logo. Scarcity/Breakouts/Buy/Sell use `main-nav` with plain text brand. Nav appearance changes when navigating between pages.
- Fix: Align all pages to use the same nav component.

### MEDIUM

**UX-M1: No season/year badge visible in PNG exports**
- When screenshots are shared on Reddit, there's no temporal context showing which season the data is from.
- Fix: Include season badge in export header area.

**UX-M2: Percentile bar colors on Prospects have no legend**
- Green/blue/yellow/orange/red scale used without documenting thresholds.
- Fix: Add a small color legend or tooltip explaining percentile ranges.

**UX-M3: Breakouts card information density**
- Each card has 7-8 visible data points. Bottom stats row could be hover/expand detail.
- Fix: Consider collapsing stats row or making it expandable.

### LOW

**UX-L1: Mismatch bar maxMismatch hardcoded at 60 in Buy/Sell**
- If scores cluster in a narrow range, bars all look similar.

**UX-L2: Scarcity player name column truncates at 100px**
- Longer names get cut off even on wide screens.

**UX-L3: Efficiency grade label size (9px) may be too small**
- The "efficiency" label under the grade badge could be slightly larger for readability.

---

## Summary

| Category | CRITICAL | HIGH | MEDIUM | LOW |
|----------|----------|------|--------|-----|
| QA | 0 | 3 | 4 | 2 |
| UX | 1 | 6 | 3 | 3 |
| **Total** | **1** | **9** | **7** | **5** |
