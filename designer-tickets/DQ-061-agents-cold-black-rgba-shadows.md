# DQ-061: Watermark missing on ~43 pages, split implementation on remaining 32

**Priority**: P2 — Brand consistency, screenshot attribution
**Category**: Brand / Consistency
**Severity**: MEDIUM — screenshots from half the site have no razzle.lol attribution

## Problem

75 HTML pages total. Only 32 have the razzle.lol watermark, implemented two different ways:

### Pattern A: CSS class (10 pages)
```html
<div class="watermark">razzle.lol</div>
```
Pages: archetypes, auction, cheatsheet, dashboard, lab, matchups, rosterbuilder, scoring, tiers, tools

### Pattern B: Inline styles (22 pages)
```html
<div style="position:fixed; bottom:10px; right:14px; font-family:var(--font-hand); font-size:14px; color:var(--ink-light); opacity:0.7; pointer-events:none; z-index:999;">razzle.lol</div>
```
Pages: aging, airyards, awards, breakouts, buysell, consistency, efficiency, explorer, handcuffs, opportunity, redzone, reportcard, scarcity, schedule, stocks, targets, tradefinder, tradevalues, usage, vorp, weekly, yoy

### Missing entirely (~43 pages)
404, about, advantage, agents, breakdown, career, career-compare, compare, comptable, draftclass, drops, dualthreat, fptsbreakdown, gamelog, gamescript, garbagetime, index, leaders, league-intel, pace, percentiles, player, playoffs, pricing, prompts, prospects, rankings, recap, records, regression, seasonpace, snapefficiency, stacks, streaks, strengths, successrate, targetpremium, tdregression, team, waivers, weeklyleaders, weeklymvp, workload

## Fix

1. Ensure `.watermark` class exists in `styles.css` (it does)
2. Convert all 22 inline-style watermarks to use the `.watermark` class
3. Add `<div class="watermark">razzle.lol</div>` to all missing pages (except 404, index, pricing, about which are special)

## Verification

Every standalone panel page should show "razzle.lol" in the bottom-right corner in both light and dark mode.
