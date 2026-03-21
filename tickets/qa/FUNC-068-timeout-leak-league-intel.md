# FUNC-068: setTimeout leak in league-intel.html (3 locations)

**Severity**: P2
**Flow**: 63 (Bureau: League Intel)
**File**: frontend/league-intel.html
**Lines**: 2956, 4705, 4911
**Status**: OPEN

## Description

Three `setTimeout()` calls create AbortController timeouts without storing the timer ID, preventing `clearTimeout()` from being called when the fetch succeeds. The same file has 15+ correct implementations of this pattern that DO store the timer ID and clear it.

## Code

### Line 2956 (inside loop — worst case)
```javascript
// INSIDE A LOOP (historyChain iterations)
var _hrAc = new AbortController(); setTimeout(function() { _hrAc.abort(); }, 10000);
rosterFetches.push(
  fetch(SLEEPER_API + "/league/" + entry.leagueId + "/rosters", { signal: _hrAc.signal })
    .then(...)
    .catch(...)  // No clearTimeout()
);
```

### Line 4705 (renderPowerRankings)
```javascript
var _prAc = new AbortController(); setTimeout(function() { _prAc.abort(); }, 10000);
var leagueResp = await fetch(SLEEPER_API + "/league/" + leagueId, { signal: _prAc.signal });
// No clearTimeout()
```

### Line 4911 (renderWaiverTendencies)
```javascript
var _wvAc = new AbortController(); setTimeout(function() { _wvAc.abort(); }, 10000);
var leagueResp = await fetch(SLEEPER_API + "/league/" + leagueId, { signal: _wvAc.signal });
// No clearTimeout()
```

## Correct pattern (same file, line 7088)
```javascript
var timer2 = setTimeout(function() { ctrl2.abort(); }, 15000);
var resp2 = await fetch(..., { signal: ctrl2.signal });
clearTimeout(timer2);  // CORRECT
```

## Fix

Store timer IDs and clear them:
```javascript
// Line 2956
var _hrTimer = setTimeout(function() { _hrAc.abort(); }, 10000);
// then add clearTimeout(_hrTimer) in .then() and .catch()

// Lines 4705, 4911
var _prTimer = setTimeout(function() { _prAc.abort(); }, 10000);
// then add clearTimeout(_prTimer) after the await
```

## Impact

Low practical impact. Timers fire after 10 seconds, abort an already-completed fetch (harmless), and self-clean. But line 2956 is inside a loop — Pro users with 5 seasons of history create 4 dangling timers per profile view. Inconsistent with the 15+ correct patterns in the same file.

## Found

Session 69, 2026-03-21. Code audit of Phase C (Bureau) changes.
