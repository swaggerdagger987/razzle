---
id: 20260320-200014-014
severity: P1
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Lab
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: structural
---

## The Compare tool is hidden in the toolbar -- it should be a primary action on player rows

**PRIORITY: P1** | **Type: structural**
**Page**: lab.html
**Found by**: Razzle (CEO Review)

Head-to-head player comparisons during rivalry weeks are one of the most screenshotted formats on fantasy Twitter/Reddit. "Should I start Lamb or Chase this week?" -- the answer should be a Razzle comparison screenshot.

The Compare tool exists in the toolbar, but the path to use it is: find the compare button -> figure out how to add players -> see the comparison. It should be frictionless: select two players from the screener -> instant side-by-side.

**BEFORE** (what it is now):
- Compare button in the screener toolbar
- Separate flow to add players to comparison
- Not integrated into the row-level interaction pattern

**AFTER** (what it should be):
- Each player row in the screener has a "compare" checkbox or icon
- Selecting two players auto-opens a comparison panel (slide-up or modal)
- Comparison shows: side-by-side stats, radar chart, trend lines, and a clear "verdict" (which player is stronger in each category, highlighted green/red)
- One-click PNG export of the comparison with watermark and shareable URL
- The comparison panel itself is screenshot-worthy: clean, data-dense, position-colored
- If 3+ players are selected, show a multi-player comparison table (up to 4)

**WHY**: Player comparisons are the #1 use case for dynasty managers evaluating trades. "Show me Chase vs. Lamb" should be a 2-click experience that produces a screenshot-ready result. Right now, the compare tool is a feature buried in a toolbar. Making it a primary row-level action turns every screener session into a potential share moment.

### Task 1: Add row-level compare selection to screener
**Accept when**: Users can select 2 players from screener rows and immediately see a side-by-side comparison panel with stats, visual charts, and PNG export.
