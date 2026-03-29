---
id: S0-001
severity: S0
category: ux-flow
title: "Standalone panel pages redirect away when visited directly"
status: open
audit: DEEP-AUDIT-TICKETS.md
decomposed-to: ux/S0-005-standalone-pages-redirect-break-shared-urls.md (FIXED)
---

# S0-001: Standalone panel pages redirect away when visited directly

## Finding

The deep audit reports that standalone panel pages (workload.html, regression.html, fptsbreakdown.html, etc.) contain a redirect script `if(window.self===window.top) window.location.replace('/lab.html?panel=...')` that immediately redirects desktop visitors to the Lab with that panel open.

## Root Cause Investigation

**Status: Redirect pattern NOT found in current codebase.**

A full grep of `/c/Users/mcgui/Documents/razzle/frontend/*.html` for `window.self`, `window.top`, and `location.replace` returns zero matches. The redirect logic has likely already been removed from the current `master` branch.

However, the page audit table in the deep audit confirms two pages still exhibited redirect behavior at audit time:
- `workload.html` — listed as "Redirect" in Loads column (audit line 839)
- `regression.html` — listed as "Redirect" in Loads column (audit line 848)

All other 72 pages loaded correctly.

## Action Required

1. **Verify** that workload.html and regression.html load correctly as standalone pages on the current deployed build at razzle.lol
2. If redirect still exists in deployed code but not in repo, it may be a stale Render deploy — redeploy from latest master
3. If the pages DO still redirect via some other mechanism (e.g. JS in app.js or a shared script), find and remove that mechanism
4. Ensure all 74 standalone pages work when visited via direct URL (bookmarks, shared links, search engine traffic)

## Why This Matters

- Shared URLs to these pages send the recipient to a different page
- Search engines index these URLs but visitors get redirected (SEO penalty)
- Bookmarks break
- Violates "every screenshot is a billboard" philosophy — screenshots with visible URLs become dead links

## Acceptance Criteria

- [ ] Visiting razzle.lol/workload.html directly loads the workload monitor (not a redirect)
- [ ] Visiting razzle.lol/regression.html directly loads the regression page (not a redirect)
- [ ] No HTML file in frontend/ contains `window.self===window.top` or `location.replace` redirect patterns
