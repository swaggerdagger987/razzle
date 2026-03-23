# DQ-102: Compare page empty state is barren

**Priority**: P2
**Category**: UX / First Impression
**Page**: compare.html
**Evidence**: compare-light-desktop.png, compare-light-mobile.png

## Problem

When a user lands on compare.html without player IDs (the default state), they see:

- "need two player IDs to compare" in Caveat font (centered)
- A single "Back to Screener" button
- Then nothing but white void until the footer

On mobile (375px) it's worse: the empty state message takes ~15% of the viewport while the footer links take ~70%. The page communicates nothing about what the compare tool does or how to use it.

A fantasy football user who clicks "Compare" expects to see a search box, a preview, or at minimum an explanation. Instead they get a dead end.

## Fix

1. Add two player search inputs (autocomplete via /api/players/quick-search) directly on the compare empty state
2. Add a Caveat annotation: "pick any two players — radar, stats, everything side by side"
3. Optionally add a mini wireframe or illustration showing what a comparison looks like (radar overlay + stat diff)
4. The "Back to Screener" button can stay as secondary action

## Verification

Navigate to compare.html with no URL params. The page should invite interaction, not feel like an error page.
