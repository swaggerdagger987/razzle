---
id: DQ-050
priority: P2
category: mobile
page: pricing.html
status: open
---

# Pricing mobile — feature comparison table cramped at 375px

## What's wrong
The 4-column feature comparison table (Feature name, Free, Pro, Elite) on pricing.html doesn't have a mobile-optimized layout. At 375px viewport width, the table relies on `overflow-x: auto` for horizontal scrolling, but the feature names and tier columns are too narrow to read comfortably. Users comparing plans on mobile — the most likely conversion scenario — can't easily scan which features are included in each tier.

## Evidence
- Screenshot: pricing.html mobile (375px) shows the comparison table in the lower section, text is very small
- The table wrapper has `overflow-x:auto;-webkit-overflow-scrolling:touch` but no responsive column adjustments

## Fix
Option A (preferred): At mobile widths, transform the table into a stacked card layout — one card per feature row showing "Feature: X | Free: yes | Pro: yes | Elite: yes" vertically.

Option B: Pin the feature name column and make the tier columns scrollable with a visual scroll indicator (shadow on the right edge).

Option C: Simplify the mobile view to show only the most important 10-15 features instead of the full matrix, with a "See full comparison" expandable.

## Files
- `frontend/pricing.html` — `.feature-matrix` table and its container, responsive CSS
