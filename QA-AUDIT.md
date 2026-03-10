# QA + UX Audit — Phases 6-10

**Date**: 2026-03-10
**Scope**: Phases 6 (QA fixes), 7 (Lab Polish), 8 (QA for Phase 7), 9 (Sidebar Intelligence), 10 (QA fixes)
**Auditor**: Evidence Collector (automated)

---

## QA FINDINGS

### CRITICAL

#### QA-1: Connection leak in `quick_search_players()` (live_data.py:562-584)
**Severity**: CRITICAL
**Issue**: `get_conn()` is called but `conn.close()` is never called. No try/finally wrapper. This endpoint powers the Ctrl+K command palette — called on every keystroke. Connections will accumulate and eventually exhaust SQLite.
**Fix**: Wrap in try/finally with `conn.close()` in the finally block.

---

### HIGH

#### QA-2: XSS via unescaped `err.message` in innerHTML (lab.js — 7 instances)
**Severity**: HIGH
**Issue**: Error messages from caught exceptions are interpolated directly into innerHTML without `escapeHtml()`. If an API returns malicious content in an error response, it could execute as HTML.
**Locations**:
- lab.js:2518 — openPlayerProfile catch
- lab.js:2538 — openCollegeProfile catch
- lab.js:3275 — openProspectProfile catch
- lab.js:4187 — tier list catch
- lab.js:4430 — big board catch
- lab.js:4805 — draft class analytics catch
- lab.js:8036 — comp finder catch
**Note**: lab.js:8476 (boom/bust) already uses `escapeHtml(err.message)` — that's the correct pattern.
**Fix**: Replace `${err.message}` with `${escapeHtml(err.message)}` in all 7 locations.

#### QA-3: Unprotected localStorage in app.js `initTheme()` / `toggleTheme()` (app.js:4-17)
**Severity**: HIGH
**Issue**: `localStorage.getItem()` and `setItem()` calls in theme initialization and toggle are not wrapped in try-catch. In Safari private browsing or with storage disabled, this throws and breaks theme initialization. Phase 10 wrapped localStorage calls in lab.js but missed app.js theme functions.
**Fix**: Wrap both `initTheme()` body and `toggleTheme()` localStorage calls in try-catch.

#### QA-4: Cold gray `#888` violates "no cold grays" design rule (lab-panels.css:292, 417)
**Severity**: HIGH
**Issue**: DESIGN.md explicitly forbids cold grays: "even dark mode stays warm (brown, not gray)". Two instances use `#888`:
- Line 292: `.tl-tier-label.F { background: #888; }` — F tier badge
- Line 417: `.tv-rank.top2 { color: #888; }` — trade value secondary rank
**Fix**: Replace `#888` with `var(--ink-light)` (#8a7565) which is the warm brown equivalent.

---

### MEDIUM

#### QA-5: Badge borders at 1px instead of 2px (lab-panels.css — ~16 instances)
**Severity**: MEDIUM
**Issue**: DESIGN.md specifies "Secondary border: 2px solid on chips, badges, toggles, buttons". Multiple badge elements use `border: 1px solid` instead.
**Key locations**: Lines 559, 596, 797, 982, 1255, 1491, 1699, 1734, 1773, 1810, 1848, 1887, 2149, 2208, 2215, 2415.
**Fix**: Change badge `border: 1px solid` to `border: 2px solid` for these badge classes.

#### QA-6: `import re` inside functions instead of module level (live_data.py:2374, 4553)
**Severity**: MEDIUM
**Issue**: `import re` is placed inside two functions rather than at the top of the module with other imports.
**Fix**: Add `import re` after line 8 and remove the two inline imports.

#### QA-7: Nested MAX(season) subquery in quick_search_players (live_data.py:575)
**Severity**: MEDIUM
**Issue**: `(SELECT MAX(season) FROM player_week_stats)` is evaluated as a correlated subquery for every row. Should be calculated once.
**Fix**: Use a CTE: `WITH ms AS (SELECT MAX(season) as s FROM player_week_stats)`.

---

### LOW

#### QA-8: Table row dividers use 1px solid instead of 2px dashed (lab-panels.css — 60+ instances)
**Severity**: LOW
**Issue**: DESIGN.md specifies "2px dashed var(--ink-faint) inside cards" for dividers. Table rows use `border-bottom: 1px solid var(--ink-faint)`. Logging only — mass-changing 60+ borders is high risk for minimal visual gain.

#### QA-9: Hardcoded position/tier colors instead of CSS variables (lab-panels.css — scattered)
**Severity**: LOW
**Issue**: Some badges use hardcoded hex colors instead of CSS variable references. Works correctly but makes dark mode maintenance harder. Logging for future dark mode pass.

---

## UX FINDINGS

### First 30 Seconds Test

#### UX-1: Sidebar search + first-visit toast working well
**Severity**: N/A (positive finding)
**Note**: Phase 9 added sidebar search. Phase 10 added first-visit toast ("62 tools in the sidebar — press ? for shortcuts"). New users get oriented quickly.

### Readability Pass

#### UX-2: Sidebar tooltips now descriptive — verified
**Severity**: N/A (positive finding)
**Note**: Phase 10 added descriptive tooltips for all jargon panels (VORP, Snap Efficiency, TD Regression, etc.).

#### UX-3: "Points Breakdown" vs "Scoring Breakdown" naming
**Severity**: LOW
**Issue**: Both panels show scoring category data in different visualizations (bars vs donut). Names are clearer after Phase 10 rename, and tooltips distinguish them, but some users may still be confused.
**Note**: Tooltips clarify. Logging only.

### Flow Test

#### UX-4: Core Lab flows working end-to-end
**Severity**: N/A (positive finding)
**Note**: All 3 core journeys verified in code: filter→sort→profile, formula→column→export, compare→share.

#### UX-5: Keyboard navigation comprehensive
**Severity**: N/A (positive finding)
**Note**: Phase 7 added full keyboard nav with ARIA roles and focus rings.

### Visual Noise Check

#### UX-6: Virtual scrolling keeps tables snappy
**Severity**: N/A (positive finding)
**Note**: Phase 7 virtual scroll handles 500+ rows with 20-row buffer and rAF.

---

## SUMMARY

| Severity | QA | UX | Total |
|----------|----|----|-------|
| CRITICAL | 1 | 0 | 1 |
| HIGH | 3 | 0 | 3 |
| MEDIUM | 3 | 0 | 3 |
| LOW | 2 | 1 | 3 |
| Positive | — | 5 | 5 |

**Verdict**: 1 CRITICAL (connection leak), 3 HIGH (XSS, localStorage, design). Must fix before next feature phase. UX is solid after Phases 7-10 polish — sidebar intelligence, keyboard nav, and virtual scrolling all working well.
