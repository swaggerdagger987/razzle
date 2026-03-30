<!-- PM: ready -->
---
id: DQ-361b
parent: 361 (Error Messages Bypass razzleError)
priority: P2
area: 5 standalone HTML pages
section: error handling
type: brand voice / DRY
status: open
depends_on: DQ-361a
---

# Replace hardcoded error strings in 5 HTML pages with razzleErrorHTML()

**Files**:
1. `frontend/advantage.html` (line ~237)
2. `frontend/weeklymvp.html` (line ~335)
3. `frontend/playoffs.html` (line ~388)
4. `frontend/targets.html` (line ~463) — has retry button, wire it through razzleErrorHTML(retryFn)
5. `frontend/weekly.html` (line ~466) — has retry button, wire it through razzleErrorHTML(retryFn)

## What to do

In each file's catch/error handler, replace the hardcoded innerHTML string with a call to `razzleErrorHTML()`. For pages that already have retry buttons, pass the retry function name.

## Accept when

- `grep -n "fumbled the data" frontend/advantage.html frontend/weeklymvp.html frontend/playoffs.html frontend/targets.html frontend/weekly.html` returns 0 matches
- Error states still render on each page (trigger by disconnecting network)
- Pages with retry buttons still have working retry

## Depends on

DQ-361a (shared function must exist first)
