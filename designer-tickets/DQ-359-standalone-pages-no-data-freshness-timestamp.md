---
id: DQ-359
title: 65+ standalone panel pages show no data freshness timestamp
priority: P3
category: UX / data trust
page: dashboard.html, tradevalues.html, breakouts.html, rankings.html, awards.html, +60 more
cycle: 46
---

## Problem

The Lab screener shows a data freshness indicator ("X s ago" badge) via `_lastFetchTime`. But none of the 65+ standalone panel pages (dashboard.html, tradevalues.html, breakouts.html, rankings.html, awards.html, etc.) show when their data was last fetched.

Users visiting /rankings.html or /tradevalues.html see data without any context of when it was generated. During the offseason (Feb-Aug), data may be months old but appears current.

## Not a duplicate of

- DES-293: covers LAB screener offseason/preseason staleness warning. This ticket covers STANDALONE PAGES which have zero freshness indication at all — not even a fetch timestamp.

## Fix

Add a shared utility that appends a freshness badge after data loads:

```js
// After fetch completes on any standalone page:
function showFreshness(containerEl) {
  var badge = document.createElement('span');
  badge.style.cssText = 'font-family:var(--font-hand); font-size:14px; color:var(--ink-light); margin-left:8px;';
  badge.textContent = 'data pulled just now';
  containerEl.appendChild(badge);
}
```

Better: add to the page subtitle area next to "2025 season" text. Keep it subtle — Caveat font, ink-light color.

## Scope

Systemic — affects 65+ standalone HTML files. Best done with a shared helper in app.js that all pages can call after their main fetch completes.

## Files
- `frontend/dashboard.html`, `frontend/tradevalues.html`, `frontend/breakouts.html`, `frontend/rankings.html`, `frontend/awards.html`, and ~60 more standalone pages
