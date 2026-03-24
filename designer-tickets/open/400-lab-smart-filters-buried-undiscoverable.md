---
id: DQ-400
priority: P2
area: lab.html
section: filter bar
type: ux / discoverability
status: open
---

# Lab Smart Filters select is buried at the end of the filter bar — beginners miss it

## What's wrong

lab.html lines 3445-3453: the Smart Filters dropdown is positioned at the far right end of the filter bar, after the "+ add filter" button. It's a plain `<select>` element with the label "Smart Filters" that contains pre-built filter combinations for common fantasy strategies.

This is the BEST feature for beginners — pre-built filters that demonstrate the screener's power without requiring knowledge of stats or operators. But it's the LAST thing in the filter bar, after manual controls that intimidate new users.

## Where

- `frontend/lab.html` lines 3445-3453: Smart Filters `<select>` element
- Filter bar layout: position/team/season/gamecount controls come first, then "+ add filter", then Smart Filters at the end

## Suggested fix

Option A: Move Smart Filters to the BEGINNING of the filter bar (before position selector). Beginners see it first, power users skip past it.

Option B: Add a prominent "Quick Filters" button with a chunky badge that opens a dropdown of pre-built combos. Give it visual weight (orange outline, Caveat label "start here").

Option C: On first visit (no localStorage state), auto-expand or highlight the Smart Filters dropdown with a pulse animation.

## Why this matters

The Lab's power is overwhelming. Smart Filters are the bridge between "I don't know where to start" and "oh, this is amazing." Burying them defeats their purpose.

## Not a dupe of

- DQ-348 (onboarding toast copy) — that's about the toast message, not filter bar layout
- DQ-352 (discovery chips no descriptions) — that's about home page chips, not Lab filters
