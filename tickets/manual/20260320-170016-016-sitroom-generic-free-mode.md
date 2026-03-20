---
id: 20260320-170016-016
severity: P1
confidence: HIGH
flow: situation-room
flow_name: Situation Room — Generic Mode for Free Users
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build Situation Room generic mode for free users

**PRIORITY: P1** | **Type: structural**
**Page**: agents.html
**Design doc**: docs/NORTH_STAR.md

Free users should be able to use the Situation Room with limitations: 5 queries per day, no league context injection, and no weekly briefings. The agents respond with general dynasty fantasy analysis (not personalized to a roster). A query counter should display remaining queries. When the limit is hit, show a friendly gate with "Go Pro for unlimited queries with your league data" CTA. The counter resets daily at midnight UTC.

### Task 1: Implement free-tier query limiting and generic mode
**Accept when**: Free users can submit up to 5 queries per day to the Situation Room. A counter shows "X/5 queries remaining today." Agent responses are generic (no league context). After 5 queries, the input is disabled and a Pro upgrade CTA is shown. The counter resets at midnight UTC. Pro users see no counter and get unlimited queries with league context.
