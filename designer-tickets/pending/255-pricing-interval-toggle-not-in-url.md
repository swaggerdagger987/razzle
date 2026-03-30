# DES-255: Pricing page interval toggle state not preserved in URL

**Priority**: P2
**Area**: pricing.html
**Cycle**: 24

## Problem

The pricing page monthly/yearly interval toggle changes displayed prices but doesn't update the URL. The page is always `/pricing.html` regardless of toggle state.

When a user:
1. Visits pricing page (defaults to yearly)
2. Switches to monthly to compare
3. Copies URL to share with a leaguemate
4. Leaguemate sees yearly prices — different from what was shared

The toggle state is also lost on page refresh. If a user switches to monthly, navigates to another page, and returns to pricing, it resets to yearly.

## Evidence

- `pricing.html:237` — `toggleInterval()` toggles CSS classes and updates DOM but never touches `window.history` or URL params
- No `URLSearchParams` or `history.replaceState` in the pricing page JS
- No `?interval=month` parameter support

## Fix

1. On toggle change, update URL: `history.replaceState(null, '', '?interval=' + interval)`
2. On page load, read URL: `new URLSearchParams(location.search).get('interval')`
3. Default to 'year' if no param

## Why This Matters

The pricing page is the conversion decision point. Shareability matters — when a user sends the pricing link to a leaguemate with "look at the monthly option," the link should show the monthly option. URL state is a core Razzle pattern (Lab screener serializes everything to URL). The pricing page should too.
