---
id: S1-003
severity: S1
category: ui-bug
title: "Player profile page may show perpetual loading state"
status: needs-verification
audit: DEEP-AUDIT-TICKETS.md
---

# S1-003: Player profile page loading state

## Finding

The deep audit reports the player profile page shows "pulling film..." loading state without rendering actual player data.

## Root Cause Investigation

**Status: Code appears correct. Needs live verification.**

**File: `frontend/player.js:38-62`**

The player profile has robust error handling:
- 10-second AbortSignal timeout (line 38)
- HTTP status validation `if (!resp.ok)` (line 41)
- Data validation for valid JSON object (line 43)
- Graceful fallback: "player not found on the film" when data missing (lines 46-53)
- Catch handler calls `razzleErrorHTML()` to replace loading state (lines 60-62)

**File: `frontend/player.html:330-332`** — Initial loading HTML: `<div class="player-loading-text">pulling film...</div>`

The code path from loading → data render → error state appears complete. The audit may have observed:
1. A transient API failure during the audit crawl
2. WebFetch unable to execute the JavaScript that replaces the loading state
3. A race condition if player ID is malformed

## Action Required

- Test on live deploy: visit razzle.lol/player/00-0036900 and verify data loads
- Test with invalid player ID to verify error state appears
- Test with slow network to verify timeout triggers error state after 10s

## Acceptance Criteria

- [ ] Player profile loads and displays data for valid player IDs
- [ ] Invalid player ID shows error state (not perpetual loading)
- [ ] 10-second timeout triggers error state with retry option
