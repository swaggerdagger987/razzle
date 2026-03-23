# DES-282: window.open() calls missing noopener on scatter chart clicks

**Priority**: P2
**Page**: explorer.html, lab-panels.js (Stat Explorer scatter chart)
**Affects**: Security consistency

## Problem

Two `window.open()` calls in the codebase open player profile pages in new tabs without the `noopener` feature:

1. `explorer.html:626` — `window.open('/player/' + encodeURIComponent(hoveredPlayer.player_id), '_blank');`
2. `lab-panels.js:7590` — `window.open('/player/' + encodeURIComponent(hoveredPlayer.player_id), '_blank');`

Every `target="_blank"` HTML link in the codebase correctly uses `rel="noopener"` (verified across all 75 pages). But the JS `window.open()` calls were missed.

While same-origin (low security risk), this is inconsistent with the strict security policy applied everywhere else. Source code inspectors notice inconsistencies.

## Fix

Add `'noopener'` as the third argument to both `window.open()` calls:

```js
// Before
window.open('/player/' + encodeURIComponent(hoveredPlayer.player_id), '_blank');

// After
window.open('/player/' + encodeURIComponent(hoveredPlayer.player_id), '_blank', 'noopener');
```

Two-line fix.

## Why This Matters

Security consistency. The entire codebase follows `rel="noopener"` on links — these 2 JS calls are the only exceptions.
