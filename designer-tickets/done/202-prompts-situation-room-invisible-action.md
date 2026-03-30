<!-- PM: ready -->
---
id: DQ-393
priority: P2
area: prompts.html
section: prompt cards
type: ux / broken feedback
status: open
---

# "Use in Situation Room" button saves to localStorage silently — user has no idea it worked

## What's wrong

prompts.html line 264: the "Use in Situation Room" button on each prompt card writes the prompt text to localStorage and navigates to /agents.html. But:

1. No toast or visual confirmation that the prompt was saved
2. No query parameter on the destination URL (e.g. `?prefilled=true`)
3. User lands on agents.html with no indication the scenario textarea was pre-filled
4. If agents.html doesn't read from localStorage on load, the prompt is lost entirely

The action is invisible. User clicks, gets navigated, and has no idea the prompt transferred.

## Where

- `frontend/prompts.html` line 264: "Use in Situation Room" link/button
- `frontend/agents.html`: needs to read localStorage prefill on load

## Suggested fix

Option A: Add a toast before navigation: "Prompt loaded — taking you to the Situation Room..."
Option B: Pass prompt via URL hash: `/agents.html#prefill=<encoded-prompt>`
Option C: Both — toast + hash parameter as backup

## Not a dupe of

- DQ-342 (prompts category headers flat) — that's about visual hierarchy, not interaction flow
