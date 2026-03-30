---
id: DES-014
priority: P2
area: index.html (home page)
status: open
created: 2026-03-22
---

# DES-014: Home page demo card says "The Diplomat" but agent name is "Bones" everywhere else

## What's Wrong

The home page Situation Room demo briefing (line 763) shows:

```html
<div class="agent-name">🦊 The Diplomat <span class="urgency ...">opportunity</span></div>
```

But `agent-config.js` defines this agent as:
- **name:** "Bones"
- **role:** "Diplomat"

The connective tissue design doc also calls him "Bones" (role: Diplomat).

So the home page uses the role title ("The Diplomat") while the rest of the product uses the name ("Bones"). A user who learns "The Diplomat" on the home page won't recognize "Bones" in the Situation Room.

Related to DES-006 (agent emoji mismatches on agents page) but this is specifically about the name discrepancy on the home page.

## Why It Matters

The home page demo briefing is the first time users see agent output. If they learn "The Diplomat" here but encounter "Bones" in the Situation Room, it breaks the earned discovery journey described in the connective tissue design doc. Agent identity must be consistent for the "oh, I recognize that character" moment to work.

## Fix

Change the demo card to use the agent's actual name:

```html
<div class="agent-name">🦊 Bones <span class="urgency ...">opportunity</span></div>
```

Or, if the decision is to use role names on the home page (which is more approachable for first-time visitors), add a subtitle pattern:

```html
<div class="agent-name">🦊 Bones — Diplomat <span class="urgency ...">opportunity</span></div>
```

## Files

- `frontend/index.html` — line 763
