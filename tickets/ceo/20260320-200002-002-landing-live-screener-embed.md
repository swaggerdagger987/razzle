---
id: 20260320-200002-002
severity: P0
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Landing Page
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: structural
---

## Replace the static screener mockup with a live interactive mini-screener

**PRIORITY: P0** | **Type: structural**
**Page**: index.html
**Found by**: Razzle (CEO Review)

The landing page shows a static mockup of the screener: "1 RB Bijan Robinson 22.4 PPG 78% snap" etc. This is a picture of what the tool does. Nobody screenshots a picture of a tool. They screenshot the tool itself.

The landing page needs a live, interactive mini-screener that shows real data. The user should be able to sort, scroll, and see actual players before they even click "Open the Screener." This IS the demo. This IS the proof. This IS what gets screenshotted.

**BEFORE** (what it is now):
- Static mockup list showing 5 fake player entries with position, name, PPG, and one stat
- Not interactive, not clickable, not real data

**AFTER** (what it should be):
- A live mini-screener component embedded in the hero section or immediately below it
- Shows real data from the API (top 15-20 players by PPG, 4-5 visible columns)
- Sortable by clicking column headers
- Position filter tabs (ALL / QB / RB / WR / TE)
- Clicking any row or a "See full screener" link goes to lab.html
- Smart filter chips below it: "Breakout Candidates" / "Buy Low" / "Sleepers" -- clicking any of these opens the Lab with that filter pre-applied
- Watermark in corner: "razzle.lol"
- If API is unavailable, fall back to the current static mockup

**WHY**: This is the single highest-leverage change for the growth flywheel. The landing page IS the screener's first impression. A live preview does three things: (1) proves the data is real and current, (2) gives the user a taste of the power without any clicks, and (3) creates a screenshot-worthy moment on the landing page itself. "Look at this free tool I found" posts on Reddit need the data to be right there, visible, impressive.

### Task 1: Build a lightweight live screener component for the landing page
**Accept when**: The landing page shows live player data from the API that's sortable and filterable, with clear pathways into the full Lab experience.
