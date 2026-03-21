---
id: 20260320-170019-019
severity: P1
confidence: HIGH
flow: lab
flow_name: Lab — Advanced Aging Curves Panel
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build advanced aging curves panel with multi-player overlay

**PRIORITY: P1** | **Type: structural**
**Page**: lab.html
**Design doc**: docs/NORTH_STAR.md

Add an aging curves visualization panel to the Lab that shows historical PPG by age for any position, with the ability to overlay individual players on top of the positional average curve. Users should be able to search for and add multiple players to compare their aging trajectories against the league-wide curve. Use position colors (QB=blue, RB=teal, WR=terracotta, TE=purple) for the curves. Data comes from terminal.db historical seasons.

### Task 1: Implement aging curves with player overlay
**Accept when**: The Lab has an "Aging Curves" panel that shows a line chart of average PPG by age for a selected position. Users can search for and overlay up to 5 individual players on the chart, each shown as a colored line with their name. The positional average curve is shown as a thick dashed line. Hovering shows exact PPG values. Position selector changes the baseline curve. Chart renders with position-appropriate colors.
