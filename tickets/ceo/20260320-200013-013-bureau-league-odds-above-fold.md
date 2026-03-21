---
id: 20260320-200013-013
severity: P0
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Bureau
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: structural
---

## Bureau league odds cards should be the FIRST thing visible after connecting -- not buried below rosters

**PRIORITY: P0** | **Type: structural**
**Page**: league-intel.html
**Found by**: Razzle (CEO Review)

The north star says Monte Carlo championship/playoff probability cards are FREE for all connected users. These are the "I need this" moment -- seeing "you have a 6.2% championship probability" is the most screenshot-worthy, group-chat-shareable, conversion-driving element in the Bureau.

But after connecting a Sleeper league, the user sees rosters and standings first. The league odds are behind a "League Odds" button. The most powerful free feature is hidden behind an extra click.

**BEFORE** (what it is now):
- After connection: league card -> click to expand -> roster view, standings, activity feed
- "League Odds" is a button you have to find and click
- Championship probability cards are not the default view

**AFTER** (what it should be):
- After connection: league card expands to show championship/playoff odds FIRST
- Each manager gets a Monte Carlo summary card: name, record, championship %, playoff %
- Cards are sorted by championship probability (highest to lowest)
- The user's own card is highlighted (orange border, "YOU" badge)
- Below the odds cards: the existing roster view, standings, and activity feed
- The odds cards are the hero of the Bureau. They're what gets screenshotted and sent to the group chat.
- Make each odds card shareable: a small "share" icon that generates a PNG of just that card with watermark

**WHY**: "I have a 6.2% championship probability and this tool says I should sell" is exactly the kind of screenshot that goes viral on r/DynastyFF. It settles arguments. It creates drama. It makes people download Razzle to check their own odds. This is the free Bureau's nuclear weapon and it's buried behind a button click. Make it the first thing everyone sees.

### Task 1: Make Monte Carlo odds cards the default Bureau view after league connection
**Accept when**: After connecting a Sleeper league and expanding a league card, championship/playoff probability cards are displayed prominently as the first content. Each card is individually shareable as PNG.
