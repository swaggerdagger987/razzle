---
id: S3-067
severity: S3
confidence: MEDIUM
category: reliability
source: DQ-121
status: OPEN
---

# 95 fetch() calls with no .catch() — silent failures sitewide

## Root Cause (UPDATED 2026-03-29 — code investigation)

**147 uncaught fetch() calls** across standalone HTML pages (original estimate 95 was conservative).

**Top 10 files by uncaught fetch count:**

| File | Count | Lines |
|------|-------|-------|
| `league-intel.html` | 25 | 3200,3239,3269,3390,3430,3431,3683,3718,3939,4039,4986,5231,5574,5753,5789,5996,6529,6883,7782,8018,8019,8046,8154,8176,8408 |
| `comptable.html` | 4 | 398,478,619,640 |
| `career-compare.html` | 4 | 449,529,581,898 |
| `percentiles.html` | 4 | 423,487,601,611 |
| `career.html` | 4 | 543,602,957,967 |
| `tradefinder.html` | 4 | 588,654,924,946 |
| `strengths.html` | 3 | 602,666,798 |
| `gamelog.html` | 3 | 399,462,622 |
| `breakdown.html` | 3 | 512,573,741 |
| `redzone.html` | 2 | 644,701 |

When the network fails or API returns an error, these calls fail silently — no user feedback, no error logging, no UI recovery.

## Fix

Add `.catch()` to all fetch calls. For user-facing operations, show error toast or fallback UI. For analytics/non-critical fetches, `console.error` is sufficient.

## Files

- 147 instances across standalone HTML pages in `frontend/`
- Highest priority: `league-intel.html` (25 instances)

## Acceptance Criteria

- All fetch calls have catch handlers
- User-facing failures show error feedback
