# FUNC-070: Dead conditional error messages in Bureau Sleeper fetches

**Severity**: P2
**Flow**: 63 — Bureau League Intel
**File**: `frontend/league-intel.html`
**Found**: Session 76 (2026-03-21)
**Status**: OPEN

## Description

Two catch blocks in league-intel.html have dead ternary conditionals where both the AbortError branch and the default branch produce the identical error message. The conditional serves no purpose.

## Locations

### 1. `loadLeagues` catch (lines 2293-2295)
```javascript
var errMsg = e.name === "AbortError"
  ? "sleeper's servers are napping. try again in a minute."
  : "sleeper's servers are napping. try again in a minute.";
```

### 2. `toggleLeague` catch (lines 2574-2576)
```javascript
var rosterErr = e.name === "AbortError"
  ? "sleeper's servers are napping. tap to retry."
  : "sleeper's servers are napping. tap to retry.";
```

## Expected

Both branches should produce different messages. Other catch blocks in the same file do this correctly:

- `showLeagues` catch (line 2166): `"field transmission timed out. try again, agent."` vs `"the wire went dark. couldn't establish contact."`
- `connectSleeper` catch (line 2133): Differentiates AbortError vs "User not found" vs default

## Fix

Replace the dead conditionals with differentiated messages:
```javascript
// loadLeagues:
var errMsg = e.name === "AbortError"
  ? "sleeper's servers timed out. check your connection and try again."
  : "sleeper's servers are napping. try again in a minute.";

// toggleLeague:
var rosterErr = e.name === "AbortError"
  ? "roster fetch timed out. tap to retry."
  : "sleeper's servers are napping. tap to retry.";
```

## Impact

Low — functional behavior is correct (error shown, retry available). User just can't distinguish timeout from other errors, making self-diagnosis harder on flaky connections.
