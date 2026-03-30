---
id: DQ-077
priority: P2
category: voice/copy
status: open
---

# DQ-077: "fumbled the data fetch" error message appears 9+ times — not centralized

## Problem
The error message "fumbled the data fetch... try again in a sec" is hardcoded in **9+ places** with slight copy variations. `razzleError()` already exists in app.js (line 464) with a rotation array, but most files don't use it.

Instances:
- advantage.html:237
- compare.js:73
- lab-panels.js:9096 (truncated: "fumbled the data...")
- lab.js:6336
- lab.js:9156 (truncated)
- player.js:59
- playoffs.html:388
- targets.html:463 (truncated + retry button)
- weekly.html:466 (truncated + retry button)
- weeklymvp.html:335

Some append "try again in a sec", some truncate to "fumbled the data...", some add retry buttons. No consistency.

## Fix
Replace all 9+ hardcoded error strings with `razzleError()` calls. The function already returns random personality errors from the RAZZLE_ERRORS array. For pages that need a retry button, wrap `razzleError()` output with the retry UI.

## Scope
9 files, swap hardcoded strings for function calls. Low effort, high brand consistency.
