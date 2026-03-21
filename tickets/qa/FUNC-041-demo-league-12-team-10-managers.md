# FUNC-041: Demo League Says "12-team" But Shows Only 10 Managers

**Severity**: P2
**Flow**: 63 (Bureau: League Intel)
**Status**: OPEN

## Problem

The demo league on league-intel.html displays "12-team Dynasty Superflex | 2024 Season" but only renders 10 manager entries (DynastyKing2024 through LuckyBounces).

A dynasty veteran would immediately notice this — if it's 12-team, where are the other 2 managers?

## Location

`frontend/league-intel.html:7354` — "12-team Dynasty Superflex"
`frontend/league-intel.html:7339-7350` — `demoManagers` array has only 10 entries

## Fix Options

1. Change label to "10-team Dynasty Superflex" (simplest)
2. Add 2 more demo managers to make 12 entries
3. Option 2 is better — 12-team is the most common dynasty format

## Impact

Low — only affects the demo view. Real Sleeper leagues would show actual team count.
