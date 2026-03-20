---
id: 20260320-170013-013
severity: P1
confidence: HIGH
flow: situation-room
flow_name: Situation Room — Agent Cross-Reference Synthesis
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build Situation Room agent cross-reference synthesis

**PRIORITY: P1** | **Type: structural**
**Page**: agents.html
**Design doc**: docs/NORTH_STAR.md

Agents in the Situation Room should cite each other's findings when producing analysis. When Hawkeye identifies a roster weakness, Bones should reference it when discussing trade targets. When Octo flags a probability shift, Atlas should connect it to historical patterns. Build a shared context object that each agent's prompt can reference, so their outputs feel like a coordinated briefing rather than isolated reports.

### Task 1: Implement shared context injection across agents
**Accept when**: When multiple agents run on the same query, each agent's prompt includes a summary of other agents' key findings. At least 2 agents demonstrably reference each other's output in their responses. The cross-reference is visible to the user as agents citing each other by name (e.g., "as Hawkeye noted, your RB depth is thin").
