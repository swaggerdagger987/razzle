---
id: DES-443
priority: P2
area: sharing
section: standalone tool pages
type: feature-gap
status: open
---

# 33 standalone tool pages lack shareable URL state

## What's wrong

Lab screener has full URL state serialization — filters, sort, columns, position, season all encode to URL params. Users can share a specific screener view via URL and it restores perfectly.

Standalone tool pages (tradevalues, rankings, breakouts, aging, matchups, etc.) encode ZERO state to the URL. If a user filters to "WR only, 2024 season, sorted by VORP" on tradevalues.html, the URL stays `/tradevalues.html`. Sharing that URL gives the recipient the default view.

## Where

Affected pages (33 total): tradevalues.html, rankings.html, breakouts.html, aging.html, weekly.html, targets.html, matchups.html, usage.html, yoy.html, airyards.html, redzone.html, efficiency.html, consistency.html, schedule.html, stocks.html, opportunity.html, reportcard.html, awards.html, vorp.html, tradefinder.html, advantage.html, dualthreat.html, tdregression.html, snapefficiency.html, garbagetime.html, seasonpace.html, targetpremium.html, workload.html, leaders.html, scarcity.html, buysell.html, stacks.html, streaks.html

## Fix

For each standalone page, encode key state to URL params via `history.replaceState`:
```javascript
function saveStateToURL() {
  const params = new URLSearchParams();
  if (position !== 'ALL') params.set('pos', position);
  if (season !== defaultSeason) params.set('season', season);
  if (sortKey !== defaultSort) params.set('sort', sortKey);
  history.replaceState(null, '', '?' + params.toString());
}
```

And restore on page load:
```javascript
const params = new URLSearchParams(window.location.search);
if (params.get('pos')) setPosition(params.get('pos'));
```

## Why it matters

The north star says "every screenshot, every shareable URL comes from the Screener." But 33 pages can't share URLs at all. A Reddit user who finds a great view on /tradevalues.html can't share the exact view — only the page. This directly hurts the screenshot-to-Reddit conversion funnel.
