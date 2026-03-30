# DES-116: 67 standalone pages skip-link targets `<span>` instead of `<main>` element

**Priority**: P3 — functional but suboptimal
**Category**: Accessibility, landmarks
**WCAG**: 2.4.1 (Bypass Blocks)

## Problem

67 standalone pages use an empty `<span id="main-content"></span>` as the skip-link target, with the actual `<main>` element appearing separately:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
...
<span id="main-content"></span>
<main class="advantage-page">
  ...
</main>
```

Only 3 pages (index.html, lab.html, agents.html) correctly use `<main id="main-content">`.

The skip link works (it scrolls to the right position), but:
1. Focus lands on a non-focusable empty `<span>`, not the main landmark
2. Screen readers don't recognize the target as the main content region
3. The `<main>` element exists but isn't the skip-link target

## Evidence

67 pages with `<span id="main-content"></span>` (separate from `<main>`):
aging.html, airyards.html, archetypes.html, advantage.html, auction.html, awards.html, breakdown.html, breakouts.html, buysell.html, career.html, career-compare.html, cheatsheet.html, compare.html, comptable.html, consistency.html, dashboard.html, draftclass.html, drops.html, dualthreat.html, efficiency.html, explorer.html, fptsbreakdown.html, gamelog.html, gamescript.html, garbagetime.html, handcuffs.html, leaders.html, matchups.html, opportunity.html, pace.html, percentiles.html, player.html, playoffs.html, prompts.html, prospects.html, rankings.html, recap.html, records.html, redzone.html, regression.html, reportcard.html, rosterbuilder.html, scarcity.html, schedule.html, scoring.html, seasonpace.html, snapefficiency.html, stacks.html, stocks.html, streaks.html, strengths.html, successrate.html, targetpremium.html, targets.html, tdregression.html, team.html, tiers.html, tools.html, tradefinder.html, tradevalues.html, usage.html, vorp.html, waivers.html, weekly.html, weeklyleaders.html, weeklymvp.html, workload.html, yoy.html

## Fix

Move `id="main-content"` from the `<span>` to the `<main>` element and delete the empty `<span>`:

Before:
```html
<span id="main-content"></span>
<main class="advantage-page">
```

After:
```html
<main id="main-content" class="advantage-page">
```

Also add `tabindex="-1"` to `<main>` so focus actually lands on it when the skip link is activated.

## Why This Matters

Low severity — skip links work functionally. But merging the target with the landmark is the correct pattern and makes the skip link experience better for screen reader users. All 67 pages follow the same template, so this is a mechanical find-and-replace.
