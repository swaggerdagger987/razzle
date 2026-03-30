<!-- PM: ready -->
---
id: DQ-358c
parent: 358 (Orange Hover Hardcoded RGBA Sitewide)
priority: P2
area: frontend standalone HTML pages
section: inline style blocks
type: color token
status: open
depends_on: DQ-358a
---

# Replace hardcoded rgba(217,119,87,0.08) in 5 standalone pages

**Files**: `frontend/advantage.html`, `frontend/comptable.html`, `frontend/drops.html`, `frontend/playoffs.html`, `frontend/auction.html`

## What to do

In each file's `<style>` block, find `rgba(217,119,87,0.08)` and replace with `var(--orange-hover)`.

Known locations:
- advantage.html:54
- comptable.html:192
- drops.html:53
- playoffs.html:143
- auction.html:177

## Accept when

- `grep -rn "rgba(217,119,87,0.08)" frontend/advantage.html frontend/comptable.html frontend/drops.html frontend/playoffs.html frontend/auction.html` returns 0 matches
- Hover states still work on each page

## Depends on

DQ-358a (CSS variable must exist first)
