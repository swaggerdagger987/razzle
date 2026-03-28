# S2-052: Agents page hero + footer use light sand (should be all dark)

**Severity**: S2 (Medium)
**Category**: design
**Source**: designer-tickets/DQ-031
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

DESIGN.md says the Situation Room (agents.html) should always be dark. The main content area IS dark, but:

1. **Hero section** (`agents.html:1614-1627`) — Uses default `var(--bg)` (light sand `#ede0cf`). No dark override.
2. **Footer** (`agents.html:2050`) — Uses `.site-footer` class which inherits light background. A `.warroom-footer` class exists with dark styling, but the actual footer element uses `.site-footer`.

The page has a jarring visual break: light hero → dark canvas/content → light footer.

## Fix

1. Set `data-theme="dark"` on the page's `<html>` or wrap the entire page in a `.warroom-dark` scoped container
2. Or explicitly style the hero and footer with dark background:
   - Hero: `background: var(--bg-ink)` / `color: var(--ink)` (in dark context)
   - Footer: Change class from `.site-footer` to `.warroom-footer` or add dark bg

## Files to Change

- `frontend/agents.html:1614-1627` — hero section styling
- `frontend/agents.html:2050` — footer class/styling

## Accept When

1. Entire agents.html page is dark from top to bottom (no light sections)
2. Hero text readable on dark background
3. Footer matches dark theme
