---
id: DQ-301
title: Player hover cards use mouse events only — invisible on touch devices
priority: P1
category: mobile-interaction
page: lab.html
---

## Problem
Player hover cards (mini profile popups on name hover) use `onmouseenter` / `onmouseleave` inline handlers only (lab.js ~line 1840). Touch devices never fire these events, so mobile/tablet users have zero access to the quick-preview feature.

## Expected
Tap on a player name shows the hover card (or a simplified version). Long-press could also work.

## Fix
Add `ontouchstart` handler that shows hover card on tap, with a `touchend` / click-outside dismiss. Alternatively, add a small "preview" icon next to player names on touch devices.

## Files
- `frontend/lab.js` — `onPlayerNameEnter()` / `onPlayerNameLeave()` handlers (~line 1840)
- `frontend/lab.js` — `showHoverCard()` positioning logic (~line 2232)
