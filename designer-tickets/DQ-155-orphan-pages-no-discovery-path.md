---
id: DQ-155
priority: P1
area: navigation
section: discoverability
type: ux-gap
status: open
---

# 37 standalone pages have no navigation path — undiscoverable

## What's wrong

37 of 75 HTML pages are orphans: they exist at valid URLs but have no link from the main nav, footer, tools hub, or any discoverable page. Users can only reach them by knowing the exact URL. This means 50% of Razzle's analytical panels are invisible.

## Where

Orphan pages (no inbound links from nav/footer/hub):
- advantage.html, awards.html, breakdown.html, career.html, career-compare.html
- comptable.html, draftclass.html, drops.html, dualthreat.html, fptsbreakdown.html
- gamelog.html, gamescript.html, garbagetime.html, handcuffs.html, leaders.html
- pace.html, percentiles.html, player.html, recap.html, records.html
- regression.html, reportcard.html, scarcity.html, scoring.html, snapefficiency.html
- stacks.html, streaks.html, strengths.html, successrate.html, targetpremium.html
- tdregression.html, team.html, workload.html, yoy.html
- Plus 404.html (expected to be orphan)

These pages ARE reachable from Lab panel navigation (lab-panels.js), but not from any top-level page. A new visitor who doesn't know to click into a Lab panel will never see them.

## Fix

Two options:
1. **Lab sidebar nav**: Add a categorized panel directory in the Lab page sidebar (Dynasty, Scoring, Efficiency, Matchup, etc.)
2. **Hub page**: Resurrect tools.html as a visual directory card grid linking all 70+ panels by category

Option 1 is simpler and keeps discovery inside the Lab. Option 2 is more Reddit-screenshot-worthy.

## Why it matters

The north star says "every screenshot, every shareable URL comes from the Screener." If 37 analytical panels have no visible entry point, they're wasted work. A Reddit user browsing razzle.lol/lab will never find /awards.html or /reportcard.html.
