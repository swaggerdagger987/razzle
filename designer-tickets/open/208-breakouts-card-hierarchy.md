<!-- PM: ready -->
---
id: DES-211a
parent: 211 (Panel Cards Hierarchy Batch 1)
priority: P2
area: breakouts.html
section: player card rendering
type: visual hierarchy
status: open
---

# Apply card rank hierarchy to breakouts page

**File**: `frontend/breakouts.html`

## What to do

In the breakouts page JS rendering function, apply CSS classes from DES-210:
- Rank #1 card: add `.card-hero` class
- Rank #2-3 cards: add `.card-spotlight` class
- All others: default (no extra class)

## Accept when

- #1 result is visually larger/bolder than #4+
- #2 and #3 are slightly elevated over the rest
- No layout breakage on mobile

## Depends on

DES-210 (CSS classes must exist first)
