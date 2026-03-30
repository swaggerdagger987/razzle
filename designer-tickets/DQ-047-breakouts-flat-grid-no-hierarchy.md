---
id: DQ-047
priority: P2
category: visual-hierarchy
page: breakouts.html
status: open
---

# Breakouts page — all cards identical visual weight, no hierarchy

## What's wrong
Every breakout candidate card on breakouts.html is the same size, same border weight, same visual emphasis. A first-time visitor scrolling through sees a wall of identically-styled cards and can't tell which breakouts matter most without reading every card's RBS score.

There's no "Top 3 Breakout Candidates" featured section, no larger hero card for the #1 breakout, no visual differentiation between high-probability and low-probability breakouts.

## Evidence
- Screenshot: breakouts.html shows a uniform card grid (Spencer Rattler, C.J. Stroud, Xavier White all look identical)
- Subtitle says "opportunity outpacing production" but the cards don't visually communicate degree of breakout potential

## Fix
1. Make the top 3 breakout cards visually distinct: larger card size, bolder border (3px instead of 2px), or a "TOP BREAKOUT" sticker badge
2. Or: add a "Featured Breakouts" row at the top with 3 hero cards, then the full grid below
3. Use the RBS score to drive visual hierarchy — cards above RBS 70 get orange top stripes, cards below 40 get muted borders

Goal: a Reddit screenshot of this page should immediately show who the top breakouts are.

## Files
- `frontend/breakouts.html` — card grid container and card styles
