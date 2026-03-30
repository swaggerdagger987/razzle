# DQ-403: 67 Secondary Pages Incorrectly Highlight "Screener" in Nav

**Priority**: P1 (misleading)
**Category**: Navigation / Cross-Page Consistency
**Pages**: 67 standalone pages (advantage.html, aging.html, airyards.html, etc.)

## Problem

67 out of 75 pages incorrectly mark the "Screener" nav link as `class="active"`, even when the current page is NOT the Screener. A user on /aging.html sees "Screener" highlighted in the top nav, creating confusion about where they are in the site.

Only primary pages (index.html, lab.html, league-intel.html, agents.html, pricing.html) should have active nav items. Secondary analytics/tool pages should either have NO active nav item, or be grouped under a parent category.

## Fix

Remove `class="active"` from the Screener nav link in all 67 secondary page HTML files. The nav `<li>` containing `<a href="/lab.html" class="active">Screener</a>` should become `<a href="/lab.html">Screener</a>`.

Affected pages include: advantage.html, aging.html, airyards.html, archetypes.html, auction.html, awards.html, breakdown.html, breakouts.html, buysell.html, career.html, career-compare.html, cheatsheet.html, compare.html, comptable.html, consistency.html, dashboard.html, draftclass.html, drops.html, dualthreat.html, efficiency.html, explorer.html, garbagetime.html, leaders.html, matchups.html, opportunity.html, percentiles.html, prospects.html, rankings.html, redzone.html, regression.html, reportcard.html, rosterbuilder.html, scarcity.html, schedule.html, scoring.html, seasonpace.html, snapefficiency.html, stocks.html, targets.html, tdregression.html, tiers.html, tools.html, tradevalues.html, tradefinder.html, usage.html, vorp.html, weekly.html, weeklyleaders.html, workload.html, yoy.html, and more.

## Evidence

- Example: advantage.html line 75: `<a href="/lab.html" class="active">Screener</a>`
- Same pattern in 67 files
- Primary pages (lab.html, index.html) correctly use active on their own nav items
