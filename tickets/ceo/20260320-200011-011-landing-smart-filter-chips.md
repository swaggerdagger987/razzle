---
id: 20260320-200011-011
severity: P1
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Landing Page
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: structural
---

## Landing page doesn't show the Screener's smart filters -- the most shareable feature

**PRIORITY: P1** | **Type: structural**
**Page**: index.html
**Found by**: Razzle (CEO Review)

The Screener has pre-built smart filters: "Breakout Candidates (Age <=25, Snap% >=50)", "Buy Low (PPG <=14, Y/CAR >=4)", "Sleepers (PPG <=12, Snap% >=40)". These are the most screenshot-worthy, shareable, Reddit-post-worthy feature in the entire product. A screenshot of "RBs under 25 with 15%+ target share -- only 4 guys" is exactly what goes viral on fantasy Twitter.

The landing page doesn't mention smart filters at all. The feature showcase doesn't surface them. The user has to find them inside the Lab by accident.

**BEFORE** (what it is now):
- Landing page mentions "100+ stat columns" and "custom formulas"
- No mention of smart filters / pre-built views
- No example of what a smart filter reveals

**AFTER** (what it should be):
- Add a "Discovery Filters" section on the landing page (between the screener preview and Bureau section)
- Show 4-6 clickable smart filter chips: "Breakout Candidates" / "Buy Low Targets" / "Workhorses" / "Sleepers" / "Rookie Risers" / "Veteran Studs"
- Each chip shows a preview count: "Breakout Candidates (7 players)"
- Clicking any chip opens the Lab with that filter pre-applied
- Below the chips, a Caveat annotation: "these update live as the season plays out"
- Optional: show a mini-result preview for one filter (e.g., "Breakout Candidates" shows 3 player names with key stats)

**WHY**: Smart filters are the Screener's "aha" moment. They take a database of 2,000+ players and surface 4-7 that match a specific insight. This is what dynasty managers screenshot and share. The landing page should make these discoverable and irresistible. Each smart filter chip is a promise: "click this and learn something you didn't know about your league."

### Task 1: Add smart filter chips section to landing page
**Accept when**: The landing page shows 4-6 clickable smart filter chips that open the Lab with the corresponding filter pre-applied. Each chip shows a live player count.
