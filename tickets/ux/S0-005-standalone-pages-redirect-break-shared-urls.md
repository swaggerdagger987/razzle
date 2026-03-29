---
id: S0-005
severity: S0
category: ux
title: 64 standalone panel pages redirect to Lab — breaks shared URLs, SEO, bookmarks
source: deep-audit
status: open
---

## Problem

Every standalone panel page (64 total) contains a redirect at **line 8** that immediately bounces visitors to `/lab.html?panel=...` when accessed directly:

```js
if(window.self===window.top)window.location.replace('/lab.html?panel=...')
```

This means:
- Shared URLs redirect the recipient to a different page
- Search engines index these pages but users get redirected (SEO penalty)
- Bookmarks break
- The "every screenshot is a billboard" philosophy fails — billboards lead to redirects

## Root Cause

All 64 files in `frontend/` have identical redirect at line 8. The redirect was added so standalone pages only render inside the Lab's iframe, but the side effect is that direct access is impossible.

## Affected Files (64)

All at **line 8**:
`advantage.html`, `aging.html`, `airyards.html`, `archetypes.html`, `auction.html`, `awards.html`, `breakdown.html`, `breakouts.html`, `buysell.html`, `career-compare.html`, `career.html`, `cheatsheet.html`, `comptable.html`, `consistency.html`, `dashboard.html`, `draftclass.html`, `drops.html`, `dualthreat.html`, `efficiency.html`, `explorer.html`, `fptsbreakdown.html`, `gamelog.html`, `gamescript.html`, `garbagetime.html`, `handcuffs.html`, `leaders.html`, `matchups.html`, `opportunity.html`, `pace.html`, `percentiles.html`, `playoffs.html`, `prospects.html`, `rankings.html`, `recap.html`, `records.html`, `redzone.html`, `regression.html`, `reportcard.html`, `rosterbuilder.html`, `scarcity.html`, `schedule.html`, `scoring.html`, `seasonpace.html`, `snapefficiency.html`, `stacks.html`, `stocks.html`, `streaks.html`, `strengths.html`, `successrate.html`, `targetpremium.html`, `targets.html`, `tdregression.html`, `tiers.html`, `tools.html`, `tradefinder.html`, `tradevalues.html`, `usage.html`, `vorp.html`, `waivers.html`, `weekly.html`, `weeklyleaders.html`, `weeklymvp.html`, `workload.html`, `yoy.html`

Notable redirect targets that differ from filename:
- `regression.html` → `?panel=tdregression`
- `prospects.html` → `?panel=prospects&u=college&cv=prospects`
- `tools.html` → `?panel=screener`

## Fix

**Option A (recommended)**: Remove the redirect entirely. Let standalone pages work as standalone pages AND as iframes. They already have full HTML/CSS/JS to render independently.

**Option B**: Replace hard redirect with a soft redirect — show a banner "View this in the Lab for the full experience" with a link, but still render the standalone content.

## Accept When

- All 64 standalone page URLs load their content when visited directly in a browser
- No `window.location.replace` redirects remain in any panel HTML file
- Shared URLs (e.g., `razzle.lol/weekly.html`) render the page content
