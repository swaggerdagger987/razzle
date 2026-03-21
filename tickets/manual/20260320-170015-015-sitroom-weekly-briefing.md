---
id: 20260320-170015-015
severity: P1
confidence: HIGH
flow: situation-room
flow_name: Situation Room — Weekly Automated Briefing
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build weekly automated briefing generation for the Situation Room

**PRIORITY: P1** | **Type: structural**
**Page**: agents.html
**Design doc**: docs/NORTH_STAR.md

Generate a weekly briefing that runs all agents against the user's league state and produces a single consolidated report. The briefing should cover: odds changes since last week, roster alerts (injuries, breakouts, busts), trade opportunities, and a Razzle-voiced executive summary. This becomes the "check Razzle once a week" habit loop. The briefing should be cached and accessible from the Situation Room landing.

### Task 1: Implement weekly briefing generation and display
**Accept when**: Connected Pro users see a "This Week's Briefing" card at the top of the Situation Room with the date, a Razzle executive summary, and expandable sections for each agent's weekly findings. The briefing is generated on first visit each week (or manually triggered) and cached in localStorage. Each section has the agent's avatar and voice. Briefing covers odds delta, roster alerts, and top trade suggestion.
