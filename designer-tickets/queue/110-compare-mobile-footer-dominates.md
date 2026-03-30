# DQ-110: Compare page mobile — footer dominates, content is tiny

**Priority**: P3
**Category**: Mobile / Layout
**Page**: compare.html
**Evidence**: compare-light-mobile.png

## Problem

On compare.html at 375px with no players selected (empty state):

- The empty state message ("need two player IDs to compare" + button) takes up ~15% of the viewport
- Blank space takes up ~15%
- The footer's 5-column link grid takes up ~70% of the viewport

The footer is the most prominent visual element on the page. The 5-column grid (Razzle, Dynasty, Weekly, Analytics, Tools) collapses to 2 columns at 375px, creating a very tall link list that extends far below the fold.

This is a generic problem across many pages at 375px — the footer is disproportionately large relative to sparse content pages. But compare.html is the worst case because the primary content is a single line of text.

## Fix

Two fixes:

1. **Compare-specific**: Add player search inputs and feature preview to the empty state (see DQ-102). This makes the content area larger and more useful.

2. **Footer-wide**: At `@media (max-width: 480px)`, collapse the footer into an accordion or a single-column compact layout. Or reduce to 3 essential link groups and hide the rest behind "More links" expandable. The footer should never dominate the viewport.

## Verification

View compare.html at 375px. The primary content area should take up the majority of visible screen space. The footer should be compact.
