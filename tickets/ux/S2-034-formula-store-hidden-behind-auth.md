---
id: S2-034
severity: S2
category: ux
title: Formula store requires account to browse — should be visible to all users
source: deep-audit
status: closed-false-positive
---

## FALSE POSITIVE

Investigation found that the formula store is ALREADY publicly accessible:
- `backend/server.py:2038` — `/api/formulas/store` endpoint has NO auth check
- `frontend/formula-store.js:23` — fetch call has no auth header requirement
- Only publishing formulas (`server.py:2054`) is gated behind `require_plan("pro")`

Browsing the store is free and unauthenticated. No fix needed.
