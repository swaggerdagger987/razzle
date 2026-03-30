---
id: DQ-307
title: Agents page uses "generic mode" jargon — meaningless to new users
priority: P2
category: copy
page: agents.html
---

## Problem
Line ~1913 of agents.html says: "Generic mode is free. League context changes everything."

"Generic mode" is internal developer terminology. A new user doesn't know:
- What "generic" means (no league data? less accurate? different agents?)
- What the alternative is (league-contextualized mode?)
- Why they should care about the distinction

## Expected
Plain English that a fantasy football player understands immediately.

## Fix
Replace with: "AI works without your league connected — that's free. Connect Sleeper and it analyzes YOUR roster, rivals, and scoring settings. That's Pro."

## Files
- `frontend/agents.html` — upsell copy (~line 1913)
