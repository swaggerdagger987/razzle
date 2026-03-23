---
id: DES-294
title: Bureau tabs may overflow at 375px mobile viewport — no scroll or wrap
severity: P2
category: Responsive/UX
page: league-intel.html
---

## What's Wrong

The Bureau has 5 tabs (Overview, Self-Scout, Rivals, Trades, History). At 768px the media query reduces font to 11px and padding to 8px 12px, but at 375px (iPhone SE) the tabs still need ~400px minimum width. The `.bureau-tabs` container has no `overflow-x: auto` and no flex-wrap — tabs may either overflow off-screen or break layout.

## Where

- `frontend/league-intel.html` lines 2425-2429: 5 tab buttons generated
- Line ~1905, 1932: media queries for tablet (768px) — reduce sizing
- No 480px or 375px breakpoint for tabs
- `.bureau-tabs` container: no `overflow-x: auto` or `flex-wrap: wrap`

## Fix

Option A (horizontal scroll): Add `overflow-x: auto; -webkit-overflow-scrolling: touch;` to `.bureau-tabs` at 480px breakpoint. Add a subtle scroll indicator (fade gradient on right edge).

Option B (stack/wrap): At `@media (max-width: 480px)`, add `flex-wrap: wrap; gap: 6px;` so tabs flow to a second line.

Option A is preferred — horizontal tab scroll is a familiar mobile pattern and avoids layout shift.

## Evidence

5 tabs × (11px text + 12px padding × 2 + 2px border × 2 + 8px gap) = ~420px minimum. iPhone SE viewport = 375px. The 768px media query reduces sizing but doesn't account for sub-400px viewports.
