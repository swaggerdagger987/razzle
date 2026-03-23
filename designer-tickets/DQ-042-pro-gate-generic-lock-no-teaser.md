---
id: DQ-042
priority: P1
category: conversion
page: lab.html (48+ panels)
status: open
---

# Pro gate — 48+ panels show identical generic lock screen with no teaser

## What's wrong
Every Pro-locked panel shows the exact same gate:
- Lock emoji
- "X is a Pro panel"
- "unlock 70+ advanced panels, full historical data, CSV export, and custom formulas with Pro"
- "See Plans" button

48+ panels. Same copy. Zero page-specific content. No preview data, no illustration, no sample screenshot.

A visitor landing on /lab.html?panel=awards from Google or Reddit sees nothing useful and bounces. This is the biggest conversion gap on the site.

## Evidence
- Screenshots: tradefinder.html and awards.html show identical lock screens
- Code verified: `switchPanel()` in lab.html renders the same generic gate for all Pro-locked panels via a single template
- `FREE_PANELS` object (lab.html ~line 4068) defines 11 free panels; everything else gets this gate

## Fix
Add per-panel teaser content to the gate. For each Pro panel, show:
1. A 1-sentence description of what THIS panel does (not generic "70+ panels")
2. A blurred/dimmed preview screenshot or sample data card
3. The generic "See Plans" CTA stays

Start with the 5 highest-traffic Pro panels (dashboard, awards, efficiency, stocks, tradefinder) and add a `PANEL_TEASERS` object mapping panel IDs to teaser descriptions + preview HTML.

## Files
- `frontend/lab.html` — `switchPanel()` function, Pro gate rendering block
