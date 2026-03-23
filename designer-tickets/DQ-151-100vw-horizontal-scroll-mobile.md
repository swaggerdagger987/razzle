---
id: DQ-151
priority: P1
area: layout
section: mobile-scroll
type: bug
status: open
---

# width: 100vw causes horizontal scrollbar on mobile

## What's wrong

`100vw` includes the scrollbar width, so any element set to `width: 100vw` or `max-width: 100vw` is wider than the visible viewport when a scrollbar is present. This creates a horizontal scrollbar on mobile and desktop. 13 instances across 4 files.

## Where

- `frontend/styles.css:270` — `.mobile-nav-overlay { width: 100vw; }`
- `frontend/styles.css:1326` — `.auth-modal { max-width: 100vw; }`
- `frontend/lab.html:2682-2683` — `.column-picker { width: 100vw; max-width: 100vw; }`
- `frontend/lab.html:2689` — `.store-modal { width: 100vw; max-width: 100vw; }`
- `frontend/lab.html:2695-2696` — `.profile-modal { width: 100vw; max-width: 100vw; }`
- `frontend/lab.html:2721-2722` — generic modal override `width: 100vw !important;`
- `frontend/lab.html:3098-3099` — another modal `width: 100vw;`
- `frontend/lab-panels.css:3763` — `.lab-panel-content { max-width: 100vw; }`
- `frontend/agents.html:1570` — `.config-panel { width: 100vw; max-width: 100vw; }`

## Fix

Replace `100vw` with `100%` in all 13 instances. `100%` respects the parent container width and does not include scrollbar width. For fixed/absolute positioned elements, use `width: 100%` or `left: 0; right: 0;` instead.

## Why it matters

Horizontal scroll on mobile is the #1 UX smell that makes a site feel amateur. Reddit users will notice this immediately on phone.
