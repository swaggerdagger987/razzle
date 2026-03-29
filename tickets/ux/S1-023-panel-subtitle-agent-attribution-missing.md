# S1-023: Panel subtitle agent attribution not implemented

**Severity**: S1 (High)
**Category**: ux
**Source**: TICKETS.md P0 "Agent Presence Invisible" Task 2
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/agent-config.js` defines agent-panel territory mappings via `getAgentForPanel(panelId)`. Each panel should show "20px agent icon + Agent Name" in its subtitle/attribution line. However, `lab-panels.js` panel render functions create panel headers without calling the agent config.

The design spec (`docs/plans/2026-03-20-agent-connective-tissue-design.md`) says every panel subtitle should include "[agent icon] Agent Name — Role" attribution. Currently panels show descriptive subtitles like "who's worth the most in your league" but no agent identity.

One example exists in `league-intel.html:4383` with a "bones-voiced" quote, but this is not systematic.

## Fix

In `lab-panels.js`, for each panel's header rendering:
1. Call `getAgentForPanel(panelId)` from agent-config.js
2. Append a 20px agent SVG icon + agent name to the panel subtitle element
3. Use Caveat font for the agent name attribution
4. Pattern: `<img src="assets/agents/{agent}.svg" width="20" height="20"> {Agent Name} — {Role}`

## Files to Change

- `frontend/lab-panels.js` — all 23+ panel render functions' header sections
- Optionally: extract a shared `renderPanelHeader(panelId, title, subtitle)` helper

## Accept When

1. Every Lab panel shows the owning agent's 20px icon and name in its subtitle area
2. Works for all 23+ panels
3. Works in both light and dark mode
4. Agent SVG icons load correctly (with onerror fallback)

## Do NOT Touch

- Panel data rendering or API calls
- Agent loading states (already working via razzleLoading())
