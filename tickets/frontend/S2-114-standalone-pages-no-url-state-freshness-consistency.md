---
id: S2-114
severity: S2
confidence: MEDIUM
category: frontend
source: DQ-155+359+363+370
status: OPEN
---

# Standalone pages lack URL state, data freshness, and consistent patterns

## Problems

1. **37 standalone pages have no navigation path** (DQ-155) — These pages are only reachable via the Lab sidebar. They have no links from the home page, footer, or tools hub. Users can't discover them organically.

2. **65+ standalone pages show no data freshness timestamp** (DQ-359) — Lab screener shows "Updated Xs ago" but standalone panels show no indication of when data was last refreshed. Users can't tell if they're looking at stale data.

3. **69+ standalone pages have no URL state serialization** (DQ-363) — Filter state (season, position, team) is lost when the URL is shared or bookmarked. The Lab screener has URL state; standalone pages don't.

4. **Season selector initialization varies across pages** (DQ-370) — Some pages use `seasonOptions()` (dynamic), some hardcode years, some default to current year. Fragmented initialization pattern.

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
