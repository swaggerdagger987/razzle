# DQ-108: Rankings page has no tier grouping or visual hierarchy

**Priority**: P2
**Category**: UX / Visual Hierarchy
**Page**: rankings.html (accessed via Lab sidebar)
**Evidence**: rankings-light-desktop.png

## Problem

The dynasty rankings page shows a flat, uniform grid of player cards with no visual differentiation between rank ranges. Player #1 and player #80 are rendered identically — same card size, same border weight, same background. The only indicator of rank order is a small number on each card.

Compare this to tiers.html, which uses S/A/B/C/D/F tier rows with distinct colored borders and clear visual hierarchy. Rankings.html looks like an unsorted phonebook despite having ranked data.

For a page that dynasty players would screenshot and share, the lack of visual hierarchy makes it flat and forgettable.

## Fix

Add tier-break dividers at rank boundaries:

- Ranks 1-12: "Elite" section header, terracotta left border
- Ranks 13-24: "Blue Chip" section header, teal left border
- Ranks 25-48: "Core" section header
- Ranks 49-72: "Depth" section header
- Ranks 73+: "Speculative" section header

Each section gets a subtle heading bar (like tiers.html) so users can immediately see where the tier breaks fall. The cards themselves stay the same — just add visual dividers between groups.

## Verification

View rankings.html. There should be clear visual tier breaks between rank groups. A user should be able to tell at a glance where "elite" ends and "core" begins.
