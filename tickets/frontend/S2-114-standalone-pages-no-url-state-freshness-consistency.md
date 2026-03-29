---
id: S2-114
severity: S2
confidence: MEDIUM
category: frontend
source: DQ-155+359+363+370
status: OPEN
---

# Standalone pages lack URL state, data freshness, and consistent patterns

## Problems (UPDATED 2026-03-29 — URL state investigation)

1. **37 standalone pages have no navigation path** (DQ-155) — Only reachable via Lab sidebar, not from home, footer, or tools hub.

2. **65+ standalone pages show no data freshness timestamp** (DQ-359) — Lab screener shows "Updated Xs ago" but standalone panels have no freshness indicator.

3. **URL state: PARTIALLY RESOLVED** — Investigation confirms 8 high-value pages DO have URL state via `savePageState()`/`restorePageState()` from `app.js:2039-2055`:
   - `weekly.html:601,608,634` — preserves `pos`, `season`
   - `matchups.html:740,748,783` — preserves `pos`, `season`
   - `rankings.html:502,536` — preserves `pos`
   - `tiers.html:401,413,424` — preserves `pos`, `season`
   - `tradevalues.html:694,700,740` — preserves `pos`, `season`
   - `efficiency.html:411,422` — preserves `pos`, `season`
   - `consistency.html:411,422` — preserves `pos`, `season`
   - `stocks.html:429,440` — preserves `pos`, `season`

   **Remaining pages WITHOUT URL state** need investigation (the 60+ other standalone pages).

4. **Season selector initialization varies across pages** (DQ-370) — Some use `seasonOptions()`, some hardcode years.

## Fix

1. Add a `_serializeUrlState()` / `_restoreUrlState()` helper to standalone pages for key filters (season, position)
2. Add a data freshness indicator using the same pattern as the Lab screener
3. Ensure all season selectors use `seasonOptions()` from `app.js`
4. Add standalone pages to the tools hub or footer navigation for discoverability

## Files

- 65+ standalone HTML files in `frontend/`
- `frontend/app.js` — shared URL state helper
- `frontend/tools.html` — tools hub directory

## Acceptance Criteria

1. Sharing a standalone page URL preserves season and position filter
2. Data freshness timestamp visible on standalone pages
3. Season selectors consistent across all pages
