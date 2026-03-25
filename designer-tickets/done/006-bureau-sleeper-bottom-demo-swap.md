<!-- PM: ready -->
---
id: DES-006
parent: 000-P0 (Bureau Epic)
priority: P0
area: league-intel.html
section: Sleeper connection + data swap
type: feature
status: open
---

# Bureau: Move Sleeper connection to bottom + demo-to-real swap

**File**: `frontend/league-intel.html`

## What to do

1. Move the Sleeper connection UI to BELOW all 6 tabs:
   - Clean card with sand background, chunky border
   - "See this for YOUR league" heading
   - Sleeper username input + "Connect" button (terracotta, chunky)
   - "Coming soon: ESPN, Yahoo" with email capture
   - Caveat note: "We only read your league data. We never post or modify anything."

2. After connecting Sleeper:
   - Replace demo data with real league data across all 6 tabs
   - Show a "Connected: [username]" indicator in the tab bar area
   - Hide the connect form, show a "Disconnect" option

3. Absorbs DES-339 (bureau preconnect whitespace) — the demo content eliminates the empty state problem.

## Accept when

- Sleeper input is at the BOTTOM of the page, below all tabs
- Demo data shows on all tabs before connection
- After Sleeper connect, real data replaces demo data
- Works in light and dark mode
- Works at 480px mobile width

## Depends on

DES-002, DES-003, DES-004, DES-005 (all tabs must exist first)
