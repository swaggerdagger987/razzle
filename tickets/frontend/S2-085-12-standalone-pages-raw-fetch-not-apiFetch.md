---
id: S2-085
severity: S2
confidence: HIGH
category: reliability
source: DQ-327
status: OPEN
---

# 12 standalone pages use raw fetch() instead of apiFetch() — no auth, no error handling

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

**`apiFetch()` definition** — `frontend/app.js:632-655`: Adds offline check, `Authorization: Bearer` header, 401 session clear, 429 rate limit messaging, generic error handling, and auto JSON parsing.

**13 pages use raw `fetch('/api/...')` instead of `apiFetch()`:**

| File | Lines | Endpoints | Priority |
|------|-------|-----------|----------|
| `league-intel.html` | 4986,5231,5574,5753,6529,6883,7782,8046,8154,8176,8408 | trade-finder, depth-lookup, monte-carlo, matchup-heatmap, waitlist | HIGH (11 calls) |
| `career-compare.html` | 449,529,581 | career-stats, quick-search | HIGH |
| `career.html` | 543,602,967 | quick-search, career-stats | HIGH |
| `comptable.html` | 398,640 | quick-search | MED |
| `gamelog.html` | 399 | quick-search | MED |
| `breakdown.html` | 512 | quick-search | MED |
| `percentiles.html` | 423,611 | quick-search | MED |
| `rosterbuilder.html` | 602,678 | quick-search, roster-grade | MED |
| `strengths.html` | 602 | quick-search | MED |
| `tradefinder.html` | 588,946 | quick-search, trade-value-chart | MED |
| `index.html` | 1047 | players | LOW |
| `agents.html` | 2307-2309 | dynasty-rankings, stock-watch, breakout-candidates | LOW |
| `tools.html` | 421 | tools-hub | LOW |

**Impact**: Pro-gated endpoints called without auth headers fail silently. 401/429 errors show no user feedback.

## Fix

Replace raw `fetch()` calls with `apiFetch()` from app.js on all 13 pages. Ensure `app.js` is loaded before page-specific scripts.

## Acceptance Criteria

- All standalone pages use `apiFetch()` for API calls
- Auth headers sent when user is logged in
- 401/429/offline errors show user-facing messages
- Consistent error handling across all pages
