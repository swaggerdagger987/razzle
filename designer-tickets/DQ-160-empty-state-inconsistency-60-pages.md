---
id: DQ-160
priority: P2
area: ux-polish
section: empty-states
type: design-gap
status: open
---

# 60 of 75 pages don't use centralized razzleEmpty() for empty states

## What's wrong

app.js provides `razzleEmpty()` — a centralized empty state helper with personality text, illustrations, and consistent styling. But only 15 of 75 pages use it. The other 60 either have inline empty state HTML (inconsistent styling) or no empty state at all (blank white space when data fails to load).

## Where

**Pages using razzleEmpty() (15 — good):**
advantage, auction, breakouts, explorer, fptsbreakdown, gamescript, garbagetime, recap, scoring, seasonpace, targets, tiers, tradevalues, weekly, weeklyleaders

**Pages NOT using razzleEmpty() (60):**
All other HTML files in frontend/ including: awards, dashboard, rankings, stocks, reportcard, leaders, consistency, efficiency, buysell, matchups, usage, yoy, airyards, aging, scarcity, opportunity, vorp, schedule, redzone, and 40+ more.

## Fix

For each page that renders data from an API, add `razzleEmpty()` as the fallback when the API returns empty results or when the container has no content. The function is already available via app.js (loaded on every page).

Priority: Start with the top-traffic pages — dashboard.html, rankings.html, stocks.html, reportcard.html, leaders.html.

## Why it matters

When a user opens a panel and sees blank white space with no feedback, they think the page is broken. The razzleEmpty() helper gives personality: "no film to pull here" is infinitely better than nothing. Consistent empty states make the product feel polished and intentional.
