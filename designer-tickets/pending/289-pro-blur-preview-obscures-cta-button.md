---
id: DES-289
title: Pro blurred preview makes content AND CTA overlay hard to read
severity: P2
category: UX/Conversion
page: league-intel.html
---

## What's Wrong

When free users view Pro-locked Bureau sections (Rivals, Trades, History), the content is blurred with `filter:blur(3px); opacity:0.4; pointer-events:none`. The blur+opacity combination creates two problems:

1. **CTA overlay competes with blurred noise** — the "Unlock" button sits on top of blurred text that's still partially readable, creating visual confusion
2. **The blur looks like a rendering bug**, not intentional gatekeeping — users may think the page failed to load

## Where

- `frontend/league-intel.html` lines 741, 1761, 1846 (CSS blur definitions)
- Lines 6353, 6533, 7254-7256 (inline blur application on cards)

## Fix

Replace blur-as-gate with a cleaner teaser pattern:
- Show 1-2 rows of REAL unblurred data (so users see what they're missing)
- Below that, a solid `var(--bg-warm)` overlay with the Pro CTA
- Or: keep blur but increase opacity to 0.2 (not 0.4) and add a solid semi-transparent overlay between blurred content and CTA

The goal: show value, not confusion. "Here's what you'd see" beats "here's something you can't read."

## Evidence

Lines 7254-7256 apply `filter:blur(3px);opacity:0.4;pointer-events:none` inline on manager cards. The CTA button sits in a sibling/overlay div. At 0.4 opacity + 3px blur, the underlying text is still partially visible but unreadable — worst of both worlds.
