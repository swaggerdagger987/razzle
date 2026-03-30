---
id: DQ-045
priority: P2
category: readability
page: tiers.html
status: open
---

# Tiers page — player chip density too cramped for readability

## What's wrong
Player chips in each tier row are packed tight with approximately 6px gap. In the S and A tiers (which have 20+ players each), the chips blur into a visual wall. Individual player names and position badges are hard to scan at a glance.

The tiers page is one of the most shareable pages (PNG export, Reddit posts). Dense chip walls make poor screenshots.

## Evidence
- Screenshot: tiers.html closeup shows S tier chips with minimal spacing
- Visual comparison: the gap between chips is barely wider than the border itself

## Fix
1. Increase `gap` on the chip flex container from ~6px to 10-12px
2. Add `row-gap: 8px` if not already set (chips wrapping to multiple rows need vertical breathing room too)
3. Consider adding a subtle `margin-bottom: 4px` between wrapped rows

This is a 1-2 line CSS change with high visual impact.

## Files
- `frontend/tiers.html` — tier row flex container gap property (likely in embedded `<style>`)
