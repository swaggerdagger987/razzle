# S2-048: Pro-locked panels show generic lock icon, no data teaser

**Severity**: S2 (Medium)
**Category**: ux
**Source**: designer-tickets/DQ-042
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/lab.html:4378-4425` — `_showUpgradeGate(panelName)` displays a generic lock emoji and upgrade prompt for ALL 48+ Pro-locked panels. Every locked panel shows identical content:
- Lock emoji
- Panel name
- "advanced analytics for serious managers"
- Generic "What you get with Pro" bullet list

No preview, teaser data, or panel-specific content is shown. A free user clicking 10 different Pro panels sees the exact same gate 10 times — no indication of what each panel actually does or why it's worth paying for.

## Fix

Replace the generic gate with a panel-specific teaser:
1. Show a blurred/faded screenshot or placeholder of the actual panel content
2. Or show 2-3 rows of real data with a "Upgrade to see all" overlay
3. Each panel should have a unique 1-sentence description of what the user would see
4. Use the agent-config.js panel territory to attribute the teaser to the right agent

## Files to Change

- `frontend/lab.html:4378-4425` — `_showUpgradeGate()` function
- Optional: add panel-specific teaser text to `agent-config.js` or a new config

## Accept When

1. Each Pro-locked panel shows unique teaser content (not all identical)
2. Free users understand what they'd get by upgrading for each specific panel
3. Teaser includes at least: panel-specific description, preview data or screenshot

## Do NOT Touch

- The actual Pro/Elite plan verification logic
- Server-side tier enforcement
