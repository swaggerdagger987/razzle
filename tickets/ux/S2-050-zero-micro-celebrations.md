# S2-050: Zero micro-celebrations on key user actions

**Severity**: S2 (Medium)
**Category**: ux
**Source**: EDGE-CASES.md #53
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

Key user actions that represent "wins" have no celebratory feedback:

1. **Watchlist add** (`frontend/lab.js` `toggleWatchlistPlayer()`) — player is added silently, no toast or animation
2. **Formula save** — no celebration or confirmation animation
3. **Screenshot export** — shows plain toast ("screenshot saved") with no personality
4. **Trial start** — no celebration when trial activates (only paid subscription gets confetti)

The paid subscription path DOES have a confetti animation (`app.js:869-879` `_showWelcomeModal()`), proving the pattern exists but isn't applied to other actions.

## Fix

Add small, tasteful celebrations for these key moments:
1. **Watchlist add**: Brief toast with personality ("Added to your board" in Caveat font) + subtle highlight animation on the star icon
2. **Formula save**: Toast with "Formula locked in" + brief shimmer on the formula name
3. **Screenshot**: Toast with "Tape's in your hands" + brief watermark preview flash
4. **Trial start**: Confetti similar to paid subscription (lighter version) + welcome message

All celebrations should respect `prefers-reduced-motion`.

## Files to Change

- `frontend/lab.js` — watchlist toggle, screenshot export
- `frontend/formulas.js` or `frontend/formula-store.js` — formula save
- `frontend/app.js` — trial activation path

## Accept When

1. Each of the 4 actions produces noticeable but non-intrusive celebratory feedback
2. Celebrations use brand voice and Caveat font
3. `prefers-reduced-motion` disables animations
4. Celebrations don't block user workflow
