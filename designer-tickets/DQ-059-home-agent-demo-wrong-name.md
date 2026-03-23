---
id: DQ-059
priority: P3
category: brand / copy
page: index.html
status: open
---

# Home page agent demo card uses wrong agent name "Bones"

## What's wrong

The home page AI agent demo section has two sample briefing cards. The second card (line 770-773) uses agent name "Bones" but DESIGN.md line 214 specifies this agent is "The Fox (Diplomat)."

This is the same issue as DQ-032 (agents.html) but on the HOME PAGE — the first place most visitors see the agents. If the agents page gets fixed but the home page doesn't, the names will be inconsistent.

## Evidence

- index.html line 770-771:
  ```html
  <div class="demo-card">
    <div class="agent-name">🦊 Bones <span class="urgency urgency-opportunity">opportunity</span></div>
  ```
- DESIGN.md line 214: "The Fox (Diplomat) — Trade negotiation and competitive intelligence."
- DQ-032 covers agents.html only (lines 1619-1624), not index.html

## Fix

Update the demo card agent name to match DESIGN.md:
```html
<div class="agent-name">🦊 The Fox <span class="urgency urgency-opportunity">opportunity</span></div>
```

Coordinate with DQ-032 fix to ensure all agent name references are updated together.

## Files
- `frontend/index.html` (line ~770)
