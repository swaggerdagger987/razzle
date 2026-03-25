<!-- PM: ready -->
---
id: DQ-361d
parent: 361 (Error Messages Bypass razzleError)
priority: P2
area: frontend/lab.js, frontend/lab-panels.js
section: error handling
type: brand voice / DRY
status: open
depends_on: DQ-361a
---

# Replace hardcoded error strings in lab.js and lab-panels.js

**Files**:
1. `frontend/lab.js` (line ~6336) — `'fumbled the data fetch... try again in a sec.'`
2. `frontend/lab.js` (line ~9156) — `'fumbled the data fetch...'`
3. `frontend/lab.js` (line ~1358) — fallback string with razzleError() attempt
4. `frontend/lab-panels.js` (line ~9096) — `'fumbled the data...'`

## What to do

Replace each hardcoded error string with `razzleErrorHTML()`. For the line ~1358 fallback, verify razzleError() is being called correctly and remove the fallback string.

Final sweep: `grep -rn "fumbled the data" frontend/lab.js frontend/lab-panels.js` should return 0 matches.

## Accept when

- Zero hardcoded "fumbled" strings remain in lab.js and lab-panels.js
- Error states still render in the Lab screener and panels
- The line ~1358 fallback is cleaned up

## Depends on

DQ-361a (shared function must exist first)
