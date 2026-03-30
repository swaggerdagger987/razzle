---
id: DES-001
priority: P2
area: home page
section: ONE-CLICK DISCOVERY FILTERS
type: layout
status: open
---

# Orphan "Veteran Studs" discovery filter chip on home page

## What's wrong

The "ONE-CLICK DISCOVERY FILTERS" section on `index.html` has 6 filter chips in a centered flex-wrap row. At both 1280px and 1440px desktop widths, only 5 chips fit on the first row. The 6th chip ("Veteran Studs") wraps to a second row and sits centered by itself.

This creates an orphan element that looks unfinished and unintentional. For a product trying to win credibility with r/DynastyFF power users, small layout sloppiness undermines the "serious tool, playful surface" brand.

## Where

`frontend/index.html` — the discovery presets/filter section (between the "WHAT YOU GET" feature cards and the "BUILT FOR THE MANAGERS" testimonial section).

## Screenshot evidence

Row 1: `Breakout Candidates | Buy Low Targets | Workhorses | Sleepers | Rookies`
Row 2 (centered, alone): `Veteran Studs`

## Suggested fix (pick one)

**Option A (simplest):** Remove "Veteran Studs" preset. 5 chips fit perfectly on one row. No CSS changes needed.

**Option B:** Add 1-2 more presets (e.g., "PPR Studs", "Upside Plays") so the second row is visually full.

**Option C:** Reduce chip horizontal padding or gap so all 6 fit on one row at 1280px.

**Option D:** Left-align the chip container (`justify-content: flex-start` instead of center) so the orphan at least sits flush-left rather than floating in the middle.

## Why this matters for conversion

This section is in the scroll path of every desktop visitor. It's meant to showcase the Screener's instant-value presets. An orphan chip makes the section look like it was thrown together. Clean layout = trust = conversion.
