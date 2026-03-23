# DES-075: Standalone panel pages missing overflow-x:auto on table containers

**Priority**: P2
**Area**: 40+ standalone HTML panel pages (loaded as Lab panel iframes)
**Cycle**: 7

## Problem

Many standalone panel pages (breakouts.html, buysell.html, consistency.html, etc.) have data tables without `overflow-x: auto` on their container. When these pages are loaded as Lab panel iframes on mobile, tables wider than the viewport get clipped instead of scrolling.

Pages WITH overflow-x:auto (20 files) — correct:
- airyards.html, career.html, consistency.html (in lab-panels.css classes), etc.

Pages WITHOUT overflow-x:auto — missing:
- breakouts.html, buysell.html, efficiency.html, stocks.html, schedule.html, vorp.html, reportcard.html, opportunity.html, and ~30 more

These pages use `overflow: hidden` on card containers (for border-radius clipping) but their inner table wrappers have no horizontal scroll mechanism.

## How to verify

1. Open Lab on a 375px viewport
2. Navigate to any panel with a data table (breakouts, stocks, reportcard, etc.)
3. Check if the table scrolls horizontally or if right columns are clipped

## Fix

Add a `.table-scroll-wrapper` pattern to each panel page's table container:

```css
.table-scroll-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

Or add to lab-panels.css as a shared class that panel pages can apply to their table containers.

## Design Rule

CLAUDE.md: "Mobile spot check" is a launch requirement. Tables must be scrollable on 375px.
