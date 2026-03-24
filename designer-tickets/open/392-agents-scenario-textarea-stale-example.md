---
id: DQ-392
priority: P2
area: agents.html
section: scenario panel
type: copy / freshness
status: open
---

# Agents scenario textarea uses stale 2023 example player context

## What's wrong

agents.html line 1772 has a placeholder example in the scenario textarea:

> "Describe the situation... e.g. 'Bijan Robinson questionable with knee injury, I need to decide on a flex play'"

Bijan Robinson was a 2023 rookie. By 2026, this example reads as dated and unattended. The placeholder is the FIRST thing a user reads when they reach the scenario panel — it should feel current.

## Where

- `frontend/agents.html` line 1772: textarea placeholder attribute

## Suggested fix

Use a timeless example that doesn't reference a specific player injury:

> "e.g. 'My RB1 is questionable this week. Should I start my handcuff or pivot to a WR flex?'"

Or rotate examples seasonally. But the simplest fix is removing the player name.

## Not a dupe of

- DQ-014 (agent name mismatch) — that's about agent persona names, not scenario copy
- DQ-032 (agent names wrong) — same, about persona names
