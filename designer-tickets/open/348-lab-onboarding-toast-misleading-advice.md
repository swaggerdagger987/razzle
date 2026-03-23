---
id: DES-348
priority: P2
area: lab.html
section: first-time user experience
type: ux / copy
status: open
---

# Lab onboarding toast gives misleading advice — data already loads automatically

## What's wrong

The first-visit onboarding toast (lab.js line 1176) says:

> "Filter by position above, explore panels in the sidebar — press ? for shortcuts"

But the Lab already auto-loads top 25 players sorted by PPR on first visit (lab.js line 1208: `await fetchAndRender()`). The user doesn't NEED to "filter by position" to see data — they already see data.

The advice implies the screener starts empty and requires action. It doesn't. The toast should guide toward CUSTOMIZATION (the actual power of the tool), not basic usage.

## Where

- `frontend/lab.js` line 1176: onboarding toast text
- `frontend/lab.js` line 1208: auto-fetch on init (data loads before toast appears at 1.5s)

## What should happen

Toast should say something like:

> "Customize columns in the sidebar. Shift+click headers for multi-sort. Press ? for all shortcuts."

This guides the user toward the POWER features (column picker, multi-sort, keyboard shortcuts) rather than suggesting they need to do something they don't.

## Not a dupe of

- DQ-215 (Lab first-load empty table) — that's about the visual impression during loading, not the toast copy
- DQ-113 (Keyboard shortcut onboarding toast) — that's a different toast about ? shortcut specifically
