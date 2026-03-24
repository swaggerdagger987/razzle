---
id: DQ-354
title: Home page Bureau section doesn't clarify which features are free vs Pro
priority: P2
category: conversion / UX clarity
page: index.html
cycle: 46
---

## Problem

The home page Bureau section (around line 752) says "Now connect your league. See what your rivals can't." with a CTA to connect. It doesn't mention that:

1. Connecting your league is FREE
2. Deep-dive features (manager profiles 5-season, trade finder, pressure map) are PRO
3. Summary data (rosters, standings, basic activity) is FREE

A user who connects their league expecting full access hits a paywall on manager profiles and trade finder. This creates surprise friction at the exact moment the user is most engaged.

## Not a duplicate of

- DES-159: covers free tier card omitting "70+ panels" (different section)
- DES-218: covers Pro feature list mismatch between home and pricing (different section)
- DES-241: covers pricing preview copy misleading free users (pricing page, not home)

## Fix

Add a subtitle under the Bureau CTA:
```html
<div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); margin-top:8px;">
  free to connect — deep-dive insights are Pro
</div>
```

This follows the brand voice ("trust the user") and sets expectations before they invest the effort of connecting their league.

## Files
- `frontend/index.html` (Bureau section, around line 752)
