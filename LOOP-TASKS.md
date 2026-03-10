# Razzle Loop — Phase 81 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 76-80)

**Current Phase**: 81 — QA + UX Audit Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from phases 76-80 audit resolved. All MEDIUM findings addressed as grouped task. Code verified syntax-clean after fixes.

---

## Task 1: CRITICAL fixes
**Status**: PASS
**Attempts**: 1
**Notes**: (1) usage.html: Renamed `window` param to `trendWindow` in loadData function (2 refs). (2) airyards.html: Renamed "Reg" column to "Regr" and added title tooltips to ALL column headers (WOPR, RACR, aDOT, AY%, Regr, etc).

## Task 2: HIGH QA fixes
**Status**: PASS
**Attempts**: 1
**Notes**: (1) yoy/airyards/explorer: Replaced `trackPageview()` with inline `fetch('/api/analytics/pageview', ...)` — 3 pages fixed. (2) usage.html: Moved `<script src="app.js">` before inline script (was at line 646, now at line 392). (3) explorer.html: Escaped `p.x`/`p.y` in tooltip with `escapeHtml(String(Number(...).toFixed(1)))` — XSS fixed + value formatting.

## Task 3: HIGH UX fixes
**Status**: PASS
**Attempts**: 1
**Notes**: (1) airyards.html: Tooltips on all column headers explaining each metric. (2) explorer.html: Cursor changes to `pointer` on dot hover, `crosshair` elsewhere; click opens player profile in new tab (`window.open` instead of `window.location.href`). (3) usage.html: Updated H1 from "Snap Count Trends" to "Usage Trends" to match nav label.

## Task 4: MEDIUM fixes (grouped)
**Status**: PASS
**Attempts**: 1
**Notes**: (1) airyards.html: Added `.air-pos-badge.qb` CSS. (2) explorer.html: Fixed event listener leak — `removeEventListener` before `addEventListener`. (3) matchups.html: Changed legend swatch border from 1px to 2px. (4) yoy/airyards/explorer: Added canvas watermark ("razzle.lol") to PNG export. (5) airyards.html: Updated subtitle to clarify "pass catchers (WR/RB/TE)". (6) explorer.html: Pre-populated axis selects with default options (Targets/G and PPG). (7) usage.html: Added title tooltip on Delta column header.

## Task 5: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py + live_data.py). JS syntax valid (5 files checked). All fixes verified: window shadow renamed (2 refs), trackPageview removed (0 on 3 pages), analytics/pageview added (1 each), app.js load order fixed (line 392), XSS escaped, QB badge added, watermarks added, Regr label updated.

---

## Loop State
```
Current Phase: 81
Current Task: 5
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 5/5
```
