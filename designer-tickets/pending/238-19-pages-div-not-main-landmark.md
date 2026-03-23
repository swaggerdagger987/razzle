# DES-238: 19 pages use `<div>` instead of `<main>` for content landmark

**Priority:** P2 — accessibility (WCAG 1.3.1)
**Page:** 19 pages sitewide
**Cycle:** 23

## Problem

56 of 75 pages correctly use `<main>` for their primary content area. 19 pages use `<div id="main-content">` or `<div class="...-page" id="...">` instead.

The skip link on every page (`<a href="#main-content">Skip to main content</a>`) works — it jumps to the div. But screen readers don't announce the div as a landmark. Users navigating by landmarks (a common screen reader pattern) skip past the entire content area.

**Affected pages:**
404.html, about.html, compare.html, drops.html, dualthreat.html, gamescript.html, garbagetime.html, leaders.html, matchups.html, player.html, prospects.html, rankings.html, seasonpace.html, snapefficiency.html, successrate.html, targetpremium.html, tdregression.html, team.html, workload.html

## Fix

Replace `<div id="main-content" class="...">` with `<main id="main-content" class="...">` on each page. Close with `</main>` instead of `</div>`.

One-line change per page × 19 pages.

## Why this matters

Screen reader users navigating by landmarks can't find the main content on 25% of pages. This is the same audience that benefits from the existing skip links, aria-labels, and aria-live regions already in place — the 19 div pages break an otherwise solid accessibility foundation.
