# QA + UX Audit — Phases 86-90

**Audit date:** 2026-03-10
**Phases covered:** 86 (QA fixes), 87 (Stock Watch), 88 (Opportunity Share), 89 (Report Card), 90 (Season Awards)

---

## QA FINDINGS

### HIGH #1: Position filter inflates opportunity share / dominator rating

**Files:** `backend/live_data.py` — `fetch_opportunity_share` (line 7030), `fetch_report_cards` (line 7211), `fetch_season_awards` (line 7505)

**What's wrong:** When a position filter is active (e.g., position=WR), the SQL query only fetches that position's players. Team totals are then built from those filtered results. This means opp_share = player_opps / WR-only-team-opps instead of / all-positions-team-opps. A WR with 15% of the full team's touches appears as 45% when only WR touches are counted. The metric definition ("targets + carries as % of team total") becomes meaningless under position filter.

**Fix:** Run a separate unfiltered query for team totals, or compute team totals before applying the position filter. Apply position filter only to the final player list, not the team aggregation.

### HIGH #2: PNG export missing canvas watermark overlay in reportcard.html and awards.html

**Files:** `frontend/reportcard.html` (export handler), `frontend/awards.html` (export handler)

**What's wrong:** The PNG export downloads the raw html2canvas output without drawing the "razzle.lol" watermark text on the canvas. Compare with stocks.html (line 700-704) and opportunity.html (line 698-701) which correctly draw `ctx.fillText('razzle.lol', ...)` after capture. Exported PNGs from report card and awards pages lack the watermark — violates the sharing engine requirement that every export carries the brand.

**Fix:** Add watermark drawing after html2canvas resolves:
```javascript
var ctx = canvas.getContext('2d');
ctx.font = '24px Caveat, cursive';
ctx.fillStyle = 'rgba(26,26,46,0.3)';
ctx.textAlign = 'right';
ctx.fillText('razzle.lol', canvas.width - 20, canvas.height - 16);
```

---

## MEDIUM FINDINGS

### MEDIUM #1: Grade string sort produces incorrect order

**Files:** `frontend/reportcard.html` (line 566-573), `frontend/stocks.html`, `frontend/opportunity.html`

**What's wrong:** When user clicks a grade column header (GPA, Eff, Con, SOS), the sort function uses `localeCompare` for strings. This produces alphabetical order: A, A+, B, B+, C, C+, D, F — which is wrong (A+ should rank above A, B+ above B). Default sort is on numeric `gpa_pct` which works correctly, so this only triggers on manual grade column clicks.

**Fix:** Map grade strings to numeric values before sorting: `{A+: 8, A: 7, B+: 6, B: 5, C+: 4, C: 3, D: 2, F: 1}`.

### MEDIUM #2: Missing referrer field in reportcard.html analytics POST

**File:** `frontend/reportcard.html` (line 710)

**What's wrong:** The analytics POST body is `{ page: '/reportcard.html' }` without the `referrer` field. All other pages include `referrer: document.referrer || ''`. Referrer data is lost for report card pageviews.

**Fix:** Add `referrer: document.referrer || ''` to the JSON body.

### MEDIUM #3: Uncaught promise rejection in awards.html analytics

**File:** `frontend/awards.html` (line 657-663)

**What's wrong:** The analytics fetch is wrapped in `try/catch` instead of `.catch()`. `try/catch` doesn't catch async promise rejections. If the network is down, the promise rejection is unhandled.

**Fix:** Replace `try { fetch(...) } catch(e) {}` with `fetch(...).catch(function() {})`.

---

## LOW FINDINGS

### LOW #1: awards.html `canvas.toDataURL()` missing explicit format

**File:** `frontend/awards.html` (line 650)

**What's wrong:** `canvas.toDataURL()` called without MIME type. Other pages use `canvas.toDataURL('image/png')` explicitly. Functionally equivalent but inconsistent.

### LOW #2: Var redeclaration in opportunity.html

**File:** `frontend/opportunity.html` (lines 523, 536)

**What's wrong:** `var val` declared twice in the same function scope. Functional due to JS hoisting but poor hygiene.

---

## UX FINDINGS

### UX — MEDIUM #1: Award cards missing drill-down links to source dashboards

**File:** `frontend/awards.html`

**What's wrong:** Each award card could link to the relevant deep-dive dashboard (MVP -> Report Card, Most Efficient -> Efficiency, Iron Man -> Consistency, etc.). Currently there's no way to "drill down" from an award to the full ranking. A dynasty FF power user seeing "MVP: Player X" would want to see the full ranking.

### UX — LOW #1: Season selector empty until first API response

**File:** `frontend/awards.html`, `frontend/reportcard.html`

**What's wrong:** The season dropdown is empty on initial page load until the API returns. There's a brief flash of an empty select element. Minor polish issue.

---

## SUMMARY

| Severity | QA | UX | Total |
|----------|----|----|-------|
| CRITICAL | 0 | 0 | 0 |
| HIGH | 2 | 0 | 2 |
| MEDIUM | 3 | 1 | 4 |
| LOW | 2 | 1 | 3 |
