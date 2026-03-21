---
id: 20260320-170014-014
severity: P1
confidence: HIGH
flow: situation-room
flow_name: Situation Room — League Context Injection
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build league context injection into all Situation Room agent prompts

**PRIORITY: P1** | **Type: structural**
**Page**: agents.html
**Design doc**: docs/NORTH_STAR.md

When a user has connected their Sleeper league, every Situation Room query should automatically inject league context into the agent prompts: the user's roster, their championship odds, positional grades, rival behavioral tags, and competitive window. This transforms generic fantasy advice into hyper-personalized intel. The context should be pulled from the Bureau's cached data (localStorage or in-memory state) without re-fetching from Sleeper.

### Task 1: Implement automatic league context injection
**Accept when**: A connected user asking "should I trade for Bijan Robinson?" gets a response that references their specific roster, their RB depth grade, the owning manager's behavioral tag, and the projected odds impact. An unconnected user gets generic analysis without league context. Context injection is automatic — the user does not need to manually provide league info.
