<!-- PM: ready -->
---
id: DES-207b
parent: 207 (About Page Personality Epic)
priority: P2
area: about.html
section: card annotations
type: brand / personality
status: open
---

# About page: add Caveat handwritten margin annotations to info cards

**File**: `frontend/about.html`

## What to do

Add Caveat-font handwritten annotations next to or below existing info cards:

- "Where does the data come from?" card → annotation: "all free, all nflverse"
- "Technology" card → annotation: "no vibes, just numbers"
- "Privacy" card → annotation: "we don't sell your data. period."

Use `font-family: 'Caveat'`, slightly rotated (-1 to 2deg), ink-light color. Similar to annotations used on other pages.

## Accept when

- At least 3 Caveat annotations visible on about page
- Annotations are slightly rotated per DESIGN.md
- Dark mode compatible
- No layout breakage on mobile (annotations stack below cards on narrow viewports)
