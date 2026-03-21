---
id: 20260320-170027-027
severity: P2
confidence: HIGH
flow: global
flow_name: Polish — Caveat Handwriting Annotations on Empty States
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Add Caveat handwriting annotations on every empty state

**PRIORITY: P2** | **Type: structural**
**Page**: all pages
**Design doc**: docs/DESIGN.md

Every empty state in the app (no search results, no league connected, no formulas saved, no history) should have a hand-written annotation in Caveat font that feels like a coach's note scribbled in the margin. These annotations should be warm, helpful, and slightly playful — guiding the user toward the action that fills the empty state. No generic "No results found" messages anywhere.

### Task 1: Audit and replace all empty states with Caveat annotations
**Accept when**: Every empty state across all pages has a Caveat-font annotation with Razzle voice. Examples: Lab with no filters = "pick a position and start scouting. the tape doesn't lie." Bureau with no league = "connect your sleeper username up top. we'll do the rest." Situation Room with no query = "ask me anything about dynasty. i've got opinions." No page shows a generic empty state. Each annotation includes a subtle directional hint (arrow or pointer toward the action).
