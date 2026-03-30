<!-- PM: ready -->
---
id: DES-207c
parent: 207 (About Page Personality Epic)
priority: P2
area: about.html
section: card layout
type: visual hierarchy
status: open
---

# About page: add visual variety to info card stack

**File**: `frontend/about.html`

## What to do

Currently all 5 info cards are identical dashed-border boxes stacked vertically. Add visual variety:

1. Give "What Razzle is" card the `.card-hero` treatment (thicker border, stronger shadow) — it's the most important
2. Add position-colored top stripes to cards (orange for data, blue for tech, teal for privacy)
3. Alternate card widths or use a 2-column grid for smaller cards on desktop

## Accept when

- Cards have visible visual hierarchy (not all identical)
- At least one card has a colored top stripe
- "What Razzle is" card is visually prominent
- Layout works at 375px mobile
