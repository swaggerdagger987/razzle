---
id: DQ-053
priority: P2
category: visual quality
page: index.html
status: open
---

# Home page "What You Get" feature cards use generic system emoji as icons

## What's wrong

The four feature cards in the "WHAT YOU GET. RIGHT NOW. FREE." section use system emoji as icons:
- Line 693: `📊` (100+ Stat Columns)
- Line 698: `🧮` (Custom Formulas)
- Line 703: `📸` (PNG Export)
- Line 708: `🔗` (Shareable URLs)

DESIGN.md calls for "comic-strip aesthetic" with "sticker-like elements" and "chunky, slightly wobbly, unmistakably playful" visual language. System emoji are generic, render differently across platforms (Windows vs Mac vs Android), and lack the Razzle personality.

## Evidence

- index.html lines 693-708: raw emoji in `.feature-card-icon` divs
- Screenshot: "What You Get" section shows small emoji icons at top of each card
- These are the most visible feature cards on the home page — first thing below the mini screener

## Fix

Replace emoji with custom inline SVGs or illustrated icons that match the Razzle design system:
- Use chunky line weight (3px stroke)
- Position-colored or orange accent
- Slightly tilted (2-3deg rotation like tier stickers)
- Size: 40-48px to match card proportions

Example: a chunky table grid icon for "100+ Stat Columns", a beaker/flask for "Custom Formulas", a polaroid frame for "PNG Export", a chain link in orange for "Shareable URLs".

## Files
- `frontend/index.html` (lines 693-708)
