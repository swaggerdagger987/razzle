# S1-022: Agent column tooltips not implemented in Lab

**Severity**: S1 (High)
**Category**: ux
**Source**: TICKETS.md P0 "Agent Presence Invisible" Task 2
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/agent-config.js` defines agent territory mappings (which agent owns which columns and panels), and `getAgentForColumn()` / `getAgentForPanel()` functions exist. However, column header tooltips in the Lab do not display agent icons or attribution.

The Lab table column headers (built in `frontend/lab.js` `renderTableHeader()`) show stat-related tooltips but never call the agent-config functions to add the 16px agent SVG icon and "Dr. Dolphin — Medical Analyst" attribution text.

`agent-config.js:216` has `getLoadingText()`, `getEmptyText()`, `getErrorText()` — these ARE wired into `razzleLoading()`/`razzleEmpty()`/`razzleError()` in `app.js`. But column header tooltips are a separate missing integration.

## Fix

In `lab.js` `renderTableHeader()` (or wherever column `<th>` elements are built), for each column:
1. Call `getAgentForColumn(columnKey)` from agent-config.js
2. If an agent is returned, add a 16px `<img>` of the agent's SVG icon + the agent's name/title to the column tooltip
3. Tooltip format: "[agent icon] Agent Name — Role"

## Files to Change

- `frontend/lab.js` — `renderTableHeader()` or column tooltip builder
- `frontend/agent-config.js` — verify `getAgentForColumn()` returns the right data

## Accept When

1. Hovering a column header in the Lab shows the owning agent's 16px icon and name in the tooltip
2. Columns without agent assignments show normal tooltips (no regression)
3. Works for both free and paid users (Layer 1 = free)

## Do NOT Touch

- Agent loading/empty/error states — those already work
- Agent nudges (Layer 3) — separate feature
