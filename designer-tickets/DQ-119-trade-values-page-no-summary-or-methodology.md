# DQ-119: Trade values page has no summary card or methodology explanation

**Priority**: P3 (UX / trust)
**Category**: Content / Visual Hierarchy
**Severity**: Low — functional but misses an opportunity for credibility

## Problem

The trade values page (tradevalues.html) opens directly into a very long horizontal bar chart with 200+ players. There is:

- No summary card explaining what the chart shows
- No methodology explanation (what factors into the composite value?)
- No top-level stats (e.g., "347 players ranked", "Values updated for 2024 season")
- No tier labels visible before the bars (just player names + bars)
- No visual break between the chart and the start of the page

The user lands on an extremely long list with no context. Compare this to the dashboard page which has "at-a-glance overview · 2024 season · 387 players tracked" — that gives immediate context.

Other standalone pages (breakouts, efficiency, consistency) all have header sections with descriptions and methodology chips. Trade values jumps straight into data.

## Screenshot evidence

Trade values page screenshot at 1440x900 shows the chart starting immediately below the nav/toolbar with no introductory content.

## Fix

Add a header card above the chart:

```html
<div class="tv-header">
  <h1>Dynasty Trade Value Chart</h1>
  <p class="panel-subtitle">Composite trade value: production (50%) + age (30%) + positional scarcity (20%)</p>
  <div class="methodology-chips">
    <span class="chip">347 players</span>
    <span class="chip">2024 season</span>
    <span class="chip">8 tiers</span>
  </div>
</div>
```

This gives users context before they scroll 200+ bars.

## Not a duplicate of

- DQ-089 (trade values no tier break dividers) — about visual dividers WITHIN the chart. This is about missing HEADER context above the chart.
- DQ-047 (breakouts flat grid no hierarchy) — about breakouts page. Different page.
