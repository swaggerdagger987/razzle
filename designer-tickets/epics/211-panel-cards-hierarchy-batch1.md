<!-- PM: ready -->
---
id: DES-211
parent: 336 (Panel Cards Epic)
priority: P2
area: breakouts.html, buysell.html, consistency.html
section: player card rendering
type: visual hierarchy
status: open
---

# Apply card rank hierarchy to breakouts, buysell, consistency pages

**Files**: `frontend/breakouts.html`, `frontend/buysell.html`, `frontend/consistency.html`

## What to do

In each page's JS rendering function, apply CSS classes from DES-210:
- Rank #1 card: add `.card-hero` class
- Rank #2-3 cards: add `.card-spotlight` class
- All others: default (no extra class)

## Accept when

- On each page, the #1 result is visually larger/bolder than #4+
- #2 and #3 are slightly elevated over the rest
- No layout breakage on mobile

## Depends on

DES-210 (CSS classes must exist first)
