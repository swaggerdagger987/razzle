# DES-152: league-intel.html (7400 lines) has no scroll-to-top button

**Priority**: P2
**Category**: Navigation UX
**Affects**: league-intel.html — the Bureau of Intelligence (conversion engine)
**Cycle**: 14

## Problem

league-intel.html is 7,400 lines — the longest page in the codebase. It has Sleeper connection, roster views, manager profiles, Monte Carlo odds, and multiple expandable sections. Despite this length, it has NO scroll-to-top button. The Lab (lab.html) has a well-designed scroll-to-top button (chunky border, offset shadow, appears at 200px scroll) that could be reused.

## Evidence

Zero matches for `scroll-to-top`, `scrollTopBtn`, or `scroll-top` in league-intel.html.

Compare with lab.html:3458 which has a fully styled `.scroll-top-btn` with:
- 36x36px, 3px ink border, 4px 4px 0 offset shadow
- Appears after 200px scroll
- Smooth scroll with `prefersReducedMotion` respect
- `aria-label="Scroll to top"`

## Fix

Add the same `.scroll-top-btn` pattern from lab.html. The CSS already exists in styles.css (lines 1707-1728). Just add the button HTML and a scroll listener that shows/hides it at 200px.

## Why it matters

The Bureau is the conversion engine. A user who connects Sleeper and scrolls through their league data needs to navigate a very long page. Without scroll-to-top, they rely on browser scrollbar or keyboard Home — poor mobile UX. The Lab already proves this pattern works.
