---
id: DQ-363
title: 69+ standalone pages have no URL state serialization — filter state lost on share
priority: P2
category: UX / shareability
page: all standalone panel pages
cycle: 47
---

## Problem

None of the 69+ standalone panel pages (dashboard.html, tradevalues.html, breakouts.html, weekly.html, aging.html, etc.) serialize user-selected state to URL parameters. Season selection, position filter, sort order, and other UI state exists only in JavaScript memory.

This means:
- Sharing a link loses all filter context
- Refreshing the page resets to defaults
- Bookmarking doesn't preserve the view
- Reddit/Discord links always show default state

The Lab screener (lab.js) has full URL state serialization. Standalone pages have none.

## Impact

The North Star says screenshots and shareable links are the growth engine. If a user finds an interesting view on /tradevalues.html?season=2025&pos=RB, they can't share it — the URL doesn't encode their selections.

## Not a duplicate of

- DQ-355: URL param validation in Lab (Lab already HAS URL state; this is about pages that lack it entirely)
- DQ-078 (done): missing canonical/OG URL (metadata, not state serialization)
- DES-255 (pending): pricing interval toggle not in URL (one page, not systemic)

## Fix

Add a shared `serializeState()` / `restoreState()` pattern using URLSearchParams + history.replaceState. At minimum, serialize: season, position filter, sort column, sort direction. Apply to all standalone pages that have filter controls.

## Files
- All 69+ standalone HTML files in `frontend/`
