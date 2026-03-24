---
id: DQ-395
priority: P2
area: lab.html
section: tools dropdown
type: ux / labeling
status: open
---

# Lab "Fantasy Only" toggle button label is semantically backwards

## What's wrong

lab.html line 3386: the "Fantasy Only" button in the Tools dropdown Display section toggles between showing all players vs fantasy-relevant players only.

The label "Fantasy Only" describes the RESULT state ("only fantasy players are showing") rather than the ACTION ("filter to fantasy-relevant"). When a user sees "Fantasy Only" as an inactive button, they think:

- "Is this already in fantasy-only mode?"
- "Will clicking this switch to some 'fantasy' display mode?"
- "What's the alternative — real football stats?"

When toggled OFF, the button shows "All Players" which IS clear. But the ON label confuses because it reads as a mode name, not a filter action.

## Where

- `frontend/lab.html` line 3386: button text
- `frontend/lab.js`: toggle handler for this button

## Suggested fix

Rename to "Roster Eligible" or "Fantasy Relevant" — both describe what the filter DOES rather than the mode it creates. Keep "All Players" for the OFF state.

## Not a dupe of

- DQ-348 (onboarding toast copy) — different UI element
- DQ-347 (100+ columns claim) — about marketing copy, not button labels
