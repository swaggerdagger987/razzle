# Razzle Loop — Phase 81 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 76-80)

**Current Phase**: 81 — QA + UX Audit Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from phases 76-80 audit resolved. All MEDIUM findings addressed as grouped task. Code verified syntax-clean after fixes.

---

## Task 1: CRITICAL fixes
**Status**: PENDING
**Attempts**: 0
**Notes**: (1) usage.html: Rename `window` parameter to `trendWindow` in loadData function and all call sites to fix global window shadowing. (2) airyards.html: Rename "Reg" column to "Regression" and add title tooltip explaining "Regression Delta: PPG rank vs Air Yards rank gap. Positive = buy low, Negative = sell high".

## Task 2: HIGH QA fixes
**Status**: PENDING
**Attempts**: 0
**Notes**: (1) yoy.html, airyards.html, explorer.html: Replace `trackPageview()` calls with inline `fetch('/api/analytics/pageview', ...)` pattern from matchups.html. (2) usage.html: Move `<script src="app.js">` before inline script block. (3) explorer.html: Escape `p.x` and `p.y` in tooltip with `escapeHtml(String(...))`.

## Task 3: HIGH UX fixes
**Status**: PENDING
**Attempts**: 0
**Notes**: (1) airyards.html: Add title tooltips to all column headers (WOPR = "Weighted Opportunity Rating", RACR = "Receiver Air Conversion Ratio", aDOT = "Average Depth of Target", AY% = "Air Yards Share of team total", Reg = "Regression Delta"). (2) explorer.html: Change cursor to `pointer` when hovering a dot, prevent navigation on click (show info panel or open in new tab). (3) usage.html: Update H1 from "Snap Count Trends" to "Usage Trends" to match nav label.

## Task 4: MEDIUM fixes (grouped)
**Status**: PENDING
**Attempts**: 0
**Notes**: (1) airyards.html: Add `.air-pos-badge.qb` CSS. (2) explorer.html: Fix event listener leak by adding listeners once with closure state. (3) matchups.html: Change legend swatch border from 1px to 2px. (4) yoy.html, airyards.html, explorer.html: Add canvas watermark to PNG export. (5) airyards.html: Add subtitle explaining no QB. (6) explorer.html: Add placeholder text to axis selects before API loads. (7) usage.html: Update "Delta" header to include window context.

## Task 5: Smoke test + verification
**Status**: PENDING
**Attempts**: 0
**Notes**: Python + JS syntax valid. All fixes verified. No regressions introduced.

---

## Loop State
```
Current Phase: 81
Current Task: 1
Current Stage: BUILD
Attempt: 1
Tasks Completed: 0/5
```
