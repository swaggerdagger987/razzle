---
id: S2-085
severity: S2
confidence: HIGH
category: reliability
source: DQ-327
status: OPEN
---

# 12 standalone pages use raw fetch() instead of apiFetch() — no auth, no error handling

## Root Cause

12 standalone pages call `fetch('/api/...')` directly instead of using the shared `apiFetch()` wrapper from app.js. This means:
- No auth token attached (Pro-gated endpoints fail silently)
- No centralized error handling
- No response.ok check in some cases
- Inconsistent retry/timeout behavior

## Fix

Replace raw `fetch()` calls with `apiFetch()` from app.js. Ensure app.js is loaded on all 12 pages.

## Files

- 12 standalone HTML pages using raw fetch (identified in DQ-327)

## Acceptance Criteria

- All standalone pages use apiFetch() for API calls
- Auth headers sent when user is logged in
- Consistent error handling across all pages
