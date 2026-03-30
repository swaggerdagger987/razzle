---
id: DES-287
title: Bureau tabs have no URL deeplink — tab state lost on refresh/share
severity: P1
category: UX
page: league-intel.html
---

## What's Wrong

`switchBureauTab()` (line 6648) switches Bureau tabs but never updates the URL. Users cannot:
- Refresh and return to the tab they were viewing (always resets to Overview)
- Share a link to a specific tab (e.g., Self-Scout or Rivals report)
- Use browser back/forward to navigate between tabs

This is a League Intel feature — users expect to share "look at this Rivals analysis" links.

## Where

- `frontend/league-intel.html` line 6648-6694: `switchBureauTab()` function
- Tab buttons at lines 2425-2429

## Fix

In `switchBureauTab()`, after switching tabs, push state to URL:
```js
const url = new URL(window.location);
url.searchParams.set('tab', tabName);
url.searchParams.set('league', leagueId);
history.replaceState(null, '', url);
```

On page load, read `?tab=` and auto-activate the correct tab.

## Evidence

Lines 2425-2429 create 5 tabs (overview, selfscout, rivals, trades, history). Line 6648 `switchBureauTab()` only toggles CSS classes — no URL update, no `history.pushState`, no `history.replaceState`.
