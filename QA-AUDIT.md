# QA + UX Audit — Phases 76-80

**Date**: 2026-03-10
**Scope**: matchups.html, usage.html, yoy.html, airyards.html, explorer.html + backend endpoints
**Pages audited**: 5 pages (Matchup Heatmap, Snap Count Trends, Year-over-Year, Air Yards, Stat Explorer)

---

## QA FINDINGS

### CRITICAL

1. **usage.html: `window` parameter shadows global `window` object** — Line 540: `loadData(season, position, window)` shadows the browser's `window` object. Player row click handlers using `window.location.href` throw TypeError. **Fix**: Rename parameter to `trendWindow`.

### HIGH

2. **yoy.html, airyards.html, explorer.html: Analytics pageview never fires** — All three call `trackPageview()` which doesn't exist. matchups.html and usage.html use the working inline `fetch('/api/analytics/pageview', ...)` pattern. **Fix**: Replace with inline fetch pattern.

3. **usage.html: app.js loaded AFTER inline script** — Line 646 loads app.js after the inline script block runs. `initQuickSearch()` call silently fails. **Fix**: Move `<script src="app.js">` before inline script.

4. **explorer.html: XSS via unescaped `p.x` and `p.y` in tooltip** — Lines 562-563 render API values directly via innerHTML without escaping. **Fix**: Wrap with `escapeHtml(String(p.x))` and `escapeHtml(String(p.y))`.

### MEDIUM

5. **airyards.html: Missing QB position badge CSS** — WR/RB/TE badge colors defined but not QB. **Fix**: Add `.air-pos-badge.qb { background: var(--pos-qb); }`.

6. **explorer.html: Event listener accumulation (memory leak)** — Every `drawChart()` call adds new event listeners without removing previous ones. **Fix**: Remove old listeners before adding new, or add once with closure.

7. **matchups.html: 1px border on legend swatches violates design guide** — Design guide: "NO thin 1px borders." **Fix**: Change to `2px solid var(--ink)`.

8. **airyards.html, matchups.html: Season selector only populates once** — If first API call fails, selector stays empty. **Fix**: Always repopulate or handle error case.

9. **yoy.html, airyards.html, explorer.html: PNG export missing watermark** — Unlike matchups/usage, these 3 pages export without "razzle.lol" branding. **Fix**: Add canvas watermark after html2canvas capture.

### LOW

10. **explorer.html: Tooltip shows raw unformatted values** — Should format with `toFixed(1)`.
11. **explorer.html: Click-while-not-hovering results in silent no-op** — `hoveredPlayer` may be null between hover and click.
12. **server.py: No validation of x_stat/y_stat at server layer** — Live_data.py validates, but defense-in-depth gap. Add allowlist in server.py.

---

## UX FINDINGS

### CRITICAL

1. **airyards.html: "Reg" column header is unreadable** — The primary insight (regression delta) labeled "Reg" with no tooltip. Users cannot determine what this number means.

### HIGH

2. **airyards.html: Multiple unexplained abbreviations** — "WOPR", "RACR", "aDOT", "AY%", "Reg" — no tooltips anywhere. Advanced analytics page is inaccessible without prior knowledge.

3. **explorer.html: Clicking dot navigates away without warning** — Cursor is `crosshair` not `pointer`, and clicking accidentally leaves the page. Users lose axis selection.

4. **usage.html: "Usage" nav vs "Snap Count Trends" H1 naming mismatch** — Sets wrong expectations.

### MEDIUM

5. **Navigation: "YoY" is jargon** — Many users won't recognize the abbreviation.
6. **explorer.html: No player labels on outlier dots** — Must hover every dot to identify players.
7. **usage.html: "Delta" column doesn't specify window context** — Should include window size.
8. **yoy.html: Mobile hides too many columns** — Delta lacks context without previous season value.
9. **airyards.html: No explanation for missing QB tab** — Users may think it's a bug.
10. **matchups.html: Click behavior in ALL mode is disorienting** — Silently switches position view.
11. **explorer.html: X/Y dropdowns start empty** — No placeholder or default options before API loads.

### LOW

12. **matchups.html: "Total" column header is vague** — Should be "Avg PPG Allowed".
13. **matchups.html: "cake"/"avoid" annotations undocumented** — Slang without legend.
14. **explorer.html: No correlation coefficient shown** — Trendline without R-squared.
15. **usage.html: Empty annotation column header** — `<th>` with no text.
16. **Cross-page: Watermark CSS implementation varies** — Different approaches (class vs inline).

---

## SUMMARY

| Severity | QA | UX | Total |
|----------|----|----|-------|
| CRITICAL | 1  | 1  | 2     |
| HIGH     | 3  | 3  | 6     |
| MEDIUM   | 5  | 7  | 12    |
| LOW      | 3  | 5  | 8     |
| **Total**| **12** | **16** | **28** |
