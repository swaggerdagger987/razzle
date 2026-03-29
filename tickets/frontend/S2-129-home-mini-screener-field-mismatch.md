---
id: S2-129
severity: S2
confidence: HIGH
category: ui-bug
source: FUNC-026, FUNC-027
status: OPEN
---

# Home page mini-screener broken: data.players→data.items + smart filter key mismatch

## Root Cause

Two bugs in `frontend/index.html`:

1. **Line ~1012** — `_miniData` function reads `data.players` but the `/api/players` endpoint returns `{items: [...]}`. Should be `data.items`. Also reads `p.display_name` but API returns `p.full_name`.

2. **Line ~708** — Smart filter chip links to `?sf=breakouts` but the SMART_FILTERS key in lab.js is `"breakout"` (no trailing "s"). The filter silently fails — user clicks "Breakout Candidates" on home page and lands on Lab with no filter applied.

**Status:** Code fixes exist locally (Ship Loop) but have not been deployed. The home page mini-screener shows "couldn't reach the film room" instead of live player data.

## Fix

1. At `index.html:~1012`:
   - Change `data.players` → `data.items`
   - Change `p.display_name` → `p.full_name`

2. At `index.html:~708`:
   - Change `?sf=breakouts` → `?sf=breakout`

## Files to Change

- `frontend/index.html:~1012` — mini-screener data field
- `frontend/index.html:~708` — smart filter chip URL

## Accept When

1. Home page mini-screener renders 15 player names with stats (not "couldn't reach the film room")
2. Clicking "Breakout Candidates" chip navigates to Lab with breakout filter active
3. Verify on localhost:8000 and after deploy
