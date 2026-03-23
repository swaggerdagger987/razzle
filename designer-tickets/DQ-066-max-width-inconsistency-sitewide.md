# DQ-066: `max-width` inconsistency — 6+ values across 70+ standalone pages

**Priority**: P2 — Jarring content-width changes when navigating between pages
**Category**: Layout / Consistency
**Severity**: MEDIUM — no standard width tokens

## Problem

Standalone pages use at least 6 different `max-width` values with no governing token or CSS class:

| Width | Pages using it | Example |
|-------|---------------|---------|
| 800px | agents.html | Situation Room |
| 900px | agents.html pricing section, breakdown.html | Narrow tools |
| 960px | compare.html | Side-by-side layout |
| 1100px | advantage, archetypes, auction, career, career-compare, dualthreat, drops, fptsbreakdown, gamelog, gamescript, garbagetime, handcuffs | Data tables |
| 1200px | aging, airyards, awards, breakouts, buysell, cheatsheet, comptable, consistency, dashboard, draftclass, efficiency, explorer, matchups, + 20 more | Most panels |
| 1440px | (none found, but Lab is full-width) | — |

When a user clicks from a 1200px page to a 960px page, the content area shrinks noticeably, then jumps back when they navigate to another 1200px page.

## Fix

Define 2-3 standard width tokens and apply consistently:

```css
/* In styles.css */
.page-narrow { max-width: 900px; margin: 0 auto; padding: 24px 20px 60px; }
.page-standard { max-width: 1200px; margin: 0 auto; padding: 24px 20px 60px; }
```

Then replace per-page `.xx-page { max-width: NNNpx; }` with the shared class.

Exceptions: agents.html (800px chat UI) and compare.html (960px side-by-side) have layout-driven reasons for narrower widths.

## Verification

Navigate between 5+ standalone pages (dashboard -> awards -> breakouts -> efficiency -> compare). Content width should feel consistent except where layout requires it.
