---
id: 20260320-170025-025
severity: P1
confidence: HIGH
flow: global
flow_name: Global — Trial Expiry Server-Side Validation
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build trial expiry server-side validation (not just JWT)

**PRIORITY: P1** | **Type: structural**
**Page**: backend/server.py
**Design doc**: docs/NORTH_STAR.md

Currently trial status may only be validated client-side via JWT expiry claims. This is trivially bypassable. Add server-side trial validation: the backend should check the user's trial_start_date in the database on every Pro-gated API request. If the trial has expired (>7 days from start), the endpoint returns 403 with a message to upgrade. The JWT should still carry trial info for fast client-side UI gating, but the server is the source of truth.

### Task 1: Implement server-side trial expiry enforcement
**Accept when**: Pro-gated API endpoints (e.g., rival analysis, trade finder, scenario explorer) validate trial expiry server-side by checking trial_start_date in the database. Expired trials return HTTP 403 with `{"error": "trial_expired", "message": "Your free trial has ended. Upgrade to Pro to continue."}`. The check cannot be bypassed by modifying the JWT. Active trials and paid Pro subscriptions pass through normally. Client-side code handles the 403 by showing the upgrade CTA.
