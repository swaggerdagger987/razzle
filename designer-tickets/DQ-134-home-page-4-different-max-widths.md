---
id: DQ-134
priority: P2
area: layout
section: home-page
type: visual-inconsistency
status: open
---

# Home page has 4 different max-width values creating uneven section edges

## What's wrong

As a user scrolls the home page, content sections jump between different widths:

1. **Hero**: `max-width: 760px` (CSS line 71)
2. **Screener visual**: `max-width: 820px` (CSS line 148)
3. **Features / chips / social proof**: `max-width: 860px` (inline style on 3 divs)
4. **Pricing**: `max-width: 960px` (CSS line 465)

This creates 4 distinct left/right edges as you scroll. The page doesn't feel like one cohesive column — it wiggles.

## Where

- `frontend/index.html` lines 71, 148, 465, 689, 716, 729

## Fix

Pick TWO widths max:
- **Narrow** (760px) for hero/text-heavy sections
- **Wide** (860px) for everything else (features, screener, social, pricing)

Or use a single `--content-width: 860px` token and apply it to all `.lp-section` elements. The pricing section (960px) is too wide — it spreads the 3 cards further apart than needed.

## Why this matters

A first-time visitor scrolling the home page should feel one smooth visual column, not content that bounces between 4 different widths. This is the first impression.
