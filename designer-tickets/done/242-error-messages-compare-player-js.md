<!-- PM: ready -->
---
id: DQ-361c
parent: 361 (Error Messages Bypass razzleError)
priority: P2
area: frontend/compare.js, frontend/player.js
section: error handling
type: brand voice / DRY
status: open
depends_on: DQ-361a
---

# Replace hardcoded error strings in compare.js and player.js

**Files**:
1. `frontend/compare.js` (line ~73)
2. `frontend/player.js` (line ~59)

## What to do

In each file's catch/error handler, replace the hardcoded `'fumbled the data fetch... try again in a sec.'` string with `razzleErrorHTML()`.

## Accept when

- `grep -n "fumbled the data" frontend/compare.js frontend/player.js` returns 0 matches
- Error states still render on compare and player profile pages

## Depends on

DQ-361a (shared function must exist first)
