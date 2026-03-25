<!-- PM: ready -->
---
id: DES-345
priority: P3
area: dashboard.html
section: top-5 + metric cards
type: responsive / mobile UX
status: open
---

# Dashboard mobile at 375px — top-5 player cards + metric cards consume 3+ screens before real content

## What's wrong

On mobile (375px), the Dynasty Dashboard's top section takes up an excessive amount of vertical space:

1. Title + subtitle + season selector (~100px)
2. 5 top-player cards stacked vertically (~5 x 120px = 600px)
3. 4 metric summary cards (~4 x 100px = 400px)

That's ~1100px of "overview" content before the user reaches the first actionable section (Rising Stocks). On a 375x812 viewport, the user must scroll 1.5+ full screens past summary cards to see any list content.

## Where

`frontend/dashboard.html` — top-5 player cards (`.db-top5-card`) and metric trend cards (`.db-trend-card`) stacked in mobile view.

## Evidence

Screenshot: dashboard-mobile.png — the first screen shows title + 2.5 player cards. The second screen shows remaining player cards + metric cards. Real list content (Rising Stocks) starts on screen 3.

## Suggested fix

1. On mobile, show top-5 as a horizontal scrollable row (one card visible, swipe for more) instead of stacked
2. Or collapse top-5 into a compact numbered list (rank + name + PPG) taking ~200px total
3. Metric cards can go in a 2x2 grid on mobile (already may be doing this, but the individual card height should shrink)
4. Consider a "jump to section" sticky chip bar below the summary cards

## Why this matters

The dashboard is a landing page for Pro users. If mobile users have to scroll past 3 screens of summary before seeing Rising/Falling Stocks (the actionable content), engagement drops. Summary should be compact; detail should be prominent.
