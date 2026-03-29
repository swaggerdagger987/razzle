---
id: S3-069
severity: S3
confidence: HIGH
category: cleanup
status: OPEN
created: 2026-03-29
source: fresh-investigation-batch-12
---

# S3-069: Dead backend endpoints with no frontend callers

## Problem

4 API endpoints in `backend/server.py` have full implementations but are not called by any frontend code. They consume code surface area, increase test burden, and may confuse future developers.

## Root Cause

These endpoints were built for features that were either:
- Never connected to the UI (athletic-radar, college/rankings, college/streaks)
- Planned but not implemented in frontend (featured)

## Evidence

| Endpoint | Line | Purpose | Frontend References |
|----------|------|---------|-------------------|
| `GET /api/athletic-radar` | server.py:1846 | Prospect athletic measurements | 0 (orphaned CSS in lab-panels.css:3799 already ticketed as S3-052) |
| `GET /api/featured` | server.py:796 | Featured/curated data | 0 |
| `GET /api/college/rankings` | server.py:1928 | College player rankings | 0 |
| `GET /api/college/streaks` | server.py:1935 | College player streaks | 0 |

Note: `/api/health` (line 726) and `/api/admin/*` endpoints are intentionally backend-only (health checks, admin tools) and are NOT dead code.

## Fix

Either:
1. Delete the 4 dead endpoints and their corresponding backend functions
2. Or add `# TODO: connect to frontend panel` comments to document their planned use

## Acceptance Criteria

- [ ] Each endpoint is either removed or documented with a clear TODO
- [ ] No runtime regressions (endpoints were already unused)

## Do NOT Touch

- `/api/health` — needed for monitoring
- `/api/analytics/summary` and `/api/admin/stats` — admin tools
- Any endpoint that IS called by frontend code
