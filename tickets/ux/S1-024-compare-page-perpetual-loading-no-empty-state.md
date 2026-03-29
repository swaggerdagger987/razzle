---
id: S1-024
severity: S1
category: ux-flow
source: DEEP-AUDIT-TICKETS.md (S1-004)
status: open
---

# S1-024: Compare page shows "pulling film..." with no clear empty state on direct visit

## Problem

When a user navigates to `/compare.html` without player URL params (e.g. from nav, bookmark, or typed URL), the page briefly flashes "pulling film..." before JS replaces it with an empty state. The empty state message ("Pick two players first, boss.") is only injected by JS — if JS is slow or fails, users see a perpetual loading spinner.

More critically, the HTML source contains only the loading state with no `<noscript>` or server-rendered fallback:

- **`frontend/compare.html:346-348`** — static HTML shows only `<div class="compare-loading"><div class="compare-loading-text">pulling film...</div></div>`
- **`frontend/compare.js:22-35`** — `init()` calls `getIdsFromURL()` and replaces innerHTML when null, but this is JS-dependent
- **`frontend/compare.js:37-48`** — `getIdsFromURL()` checks pathname `/compare/{id1}/{id2}` and query `?p1=&p2=` patterns

## Root Cause

The compare page has no HTML-level empty state. The "pulling film..." div is the only content rendered before JS executes. The JS `init()` function correctly detects missing params and swaps in an empty state, but:

1. The flash of "pulling film..." before JS runs creates a broken-looking first impression
2. If JS fails to load (network issue, CDN error), users see permanent "pulling film..."
3. The empty state message is buried in JS rather than being the default HTML state

## Fix

In `frontend/compare.html:346-348`, replace the loading div with a proper HTML empty state that JS can then replace with either data or a refined empty state. The default HTML should show "Search for 2+ players to compare them side by side" with a link to the Lab, not a loading spinner.

## Acceptance Criteria

- [ ] Visiting `/compare.html` with no params shows a clear instructional empty state, not "pulling film..."
- [ ] The empty state includes search inputs or a link to the Lab
- [ ] "pulling film..." only appears AFTER the user has selected players and data is being fetched
- [ ] If JS fails to load, the page still shows a usable message (not a spinner)
