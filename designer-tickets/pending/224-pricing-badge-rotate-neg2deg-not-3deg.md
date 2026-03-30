# DES-224: Pricing badge and save badge use rotate(-2deg) — DESIGN.md says rotate(3deg)

**Priority**: P2 (Design system consistency — sticker badges off-spec)
**Pages**: index.html, pricing.html, styles.css
**Category**: Design system / Visual consistency

## The Problem

DESIGN.md specifies tier stickers should use `rotate(3deg)` — "slapped on, not placed." Three sticker/badge elements use `rotate(-2deg)` instead:

1. **index.html line 514**: `.pricing-badge { transform: translateX(-50%) rotate(-2deg); }` — the "the film room upgrade" / "full war machine" badges on home page pricing cards
2. **pricing.html line 52**: `.save-badge { transform: rotate(-2deg); }` — the "save 33%" badge on pricing page
3. **styles.css line 186**: `.logo-tiger { transform: rotate(-2deg); }` — the logo tiger icon

DES-142 fixed `rotate(2deg)` → `rotate(3deg)` in styles.css for tier stickers but missed these three page-specific instances.

## Evidence

- DESIGN.md: "Tier Stickers: slightly rotated (rotate(3deg)) — slapped on, not placed"
- pricing.html line 101: `.plan-badge--elite { transform: rotate(3deg); }` — correctly uses 3deg
- The same page has inconsistent rotation: save-badge at -2deg, elite badge at 3deg

## The Fix

1. `index.html line 514`: Change `rotate(-2deg)` to `rotate(-3deg)` (negative is fine for variety, but should be 3 degrees)
2. `pricing.html line 52`: Change `rotate(-2deg)` to `rotate(-3deg)`
3. `styles.css line 186`: Change `rotate(-2deg)` to `rotate(-3deg)` (logo tiger — subtle tilt)

Use `rotate(-3deg)` (negative for left-lean variety) or `rotate(3deg)` — either is on-spec. The current `-2deg` is not.

## Why This Matters

Small detail, but DESIGN.md exists for a reason. If badges tilt 2deg in some places and 3deg in others, the visual rhythm feels off. Consistency in these micro-details is what makes the comic-strip aesthetic feel intentional rather than accidental.
