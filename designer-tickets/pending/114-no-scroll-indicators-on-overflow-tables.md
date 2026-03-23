# DES-114: Zero scroll indicators on horizontally scrollable tables

**Priority**: P2 — mobile usability (Twitter/Reddit traffic is mobile-heavy)
**Category**: Mobile usability, visual design
**WCAG**: 1.4.10 (Reflow)

## Problem

58+ pages have `overflow-x: auto` on table containers, meaning tables scroll horizontally on mobile. But there is zero visual indication that content extends offscreen:
- No gradient shadow on the right edge
- No arrow indicator
- No "scroll for more" hint
- No fade effect

Mobile users from Twitter/Reddit (the primary acquisition channel) may see only the first 3-4 columns and never realize there are 5-8 more columns off-screen.

## Scope

All 58 pages with `overflow-x: auto`:
advantage.html, airyards.html, agents.html, auction.html, career-compare.html, career.html, comptable.html, consistency.html, draftclass.html, drops.html (x2), dualthreat.html, efficiency.html, fptsbreakdown.html, gamelog.html, gamescript.html (x2), garbagetime.html, handcuffs.html, lab.html (x8), league-intel.html (x3), matchups.html, opportunity.html, playoffs.html, pricing.html, records.html, redzone.html, regression.html, reportcard.html, schedule.html, scoring.html, seasonpace.html, snapefficiency.html, stacks.html, stocks.html, streaks.html, successrate.html, targetpremium.html, tdregression.html, tradefinder.html, usage.html, vorp.html, waivers.html, weekly.html, weeklyleaders.html, weeklymvp.html (x2), workload.html, yoy.html

## Fix

CSS-only solution using pseudo-elements on the scroll container:

```css
.table-scroll-container {
  position: relative;
}
.table-scroll-container::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 24px;
  background: linear-gradient(to right, transparent, var(--bg, #ede0cf));
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.2s;
}
```

Note: This uses a linear-gradient, which is technically banned by DESIGN.md for visual elements — but a scroll indicator fade is a functional UI pattern, not a decorative gradient. If gradient is still rejected, use a solid shadow: `box-shadow: inset -16px 0 8px -8px rgba(45, 31, 20, 0.1)`.

Add JS to hide the indicator when scrolled to the end.

## Why This Matters

Mobile traffic from Twitter/Reddit is the primary acquisition channel. If mobile users don't know to scroll right on data tables, they see incomplete data and think the tool is limited. GTM report confirms mobile is 62% of fantasy football traffic.
