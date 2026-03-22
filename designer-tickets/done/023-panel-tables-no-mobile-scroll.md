# DES-023: Multiple panel tables lack overflow-x:auto for mobile scroll

**Priority**: P2
**Area**: lab-panels.css
**Impact**: Several panel table containers use `overflow: hidden` instead of `overflow-x: auto`, causing data to be clipped/truncated on mobile instead of allowing horizontal scroll. Users lose columns of data on phones.

## The Problem

`frontend/lab-panels.css` — containers with `overflow: hidden` that wrap data tables:
- Line 90: card container (affects multiple panels)
- Line 283: card container
- Line 400: card container
- Line 539: card container
- Line 668: VORP card container
- Line 739: Positional Advantage card

Some panels DO have `overflow-x: auto` correctly:
- Line 305: Dynasty History wrap (correct)
- Line 767: Auction Values table wrap (correct)
- Line 883: Dynasty History mobile override (correct)
- Line 2127: Weekly Heatmap container (correct)
- Line 2233: Matchup Heatmap wrap (correct)

The pattern is inconsistent — some panels got the fix, others didn't.

## The Fix

For each panel card that contains a data table, ensure the table wrapper has:
```css
overflow-x: auto;
-webkit-overflow-scrolling: touch;
```

At minimum, add a 768px media query:
```css
@media (max-width: 768px) {
  .lp-card { overflow-x: auto; -webkit-overflow-scrolling: touch; }
}
```

## Why This Matters

Twitter and Reddit traffic is majority mobile. If someone clicks a Lab panel link from their phone and the table data is cut off, they won't upgrade to Pro. Every panel needs to work on mobile.
