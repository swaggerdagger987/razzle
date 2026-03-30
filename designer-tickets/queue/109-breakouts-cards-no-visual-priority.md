# DQ-109: Breakout cards grid lacks visual prioritization

**Priority**: P3
**Category**: UX / Visual Hierarchy
**Page**: breakouts.html
**Evidence**: breakouts-light-desktop.png, breakouts-dark-desktop.png

## Problem

breakouts.html shows 40+ breakout candidate cards in a grid that all look identical. High-confidence breakout candidates (high RBS score) have the same card styling as low-confidence ones. The teal progress bars on every card all look the same. The RBS number is shown but there's no visual grouping or color differentiation.

A user scanning this page can't quickly identify the top breakout candidates without reading every card's RBS number. The page is a sea of identical cards.

## Fix

Tier the cards visually by RBS score:

1. **Top tier (RBS 80+)**: terracotta/gold top stripe (6px), slightly larger card, or a "Hot" sticker badge (rotated per DESIGN.md)
2. **Mid tier (RBS 50-79)**: standard card styling (current)
3. **Lower tier (RBS <50)**: slightly muted/faded card (opacity 0.85 or lighter border)

OR add tier-break section headers between groups: "Top Breakout Candidates" / "Emerging Names" / "Watch List" — similar to the fix for rankings (DQ-108).

Either approach creates visual hierarchy so users' eyes are drawn to the highest-confidence candidates first.

## Verification

View breakouts.html. The top breakout candidates should visually pop compared to lower-scored ones. A user should be able to identify the top 5-10 without reading every card.
