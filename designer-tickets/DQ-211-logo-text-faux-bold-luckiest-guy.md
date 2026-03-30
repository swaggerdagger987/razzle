# DQ-211: Logo text faux-bold on single-weight Luckiest Guy

**Priority**: P2
**Category**: Typography
**Page**: Sitewide (every page with nav)

## What's wrong

`.logo-text` in `styles.css:192` uses `font-weight: 700` but Luckiest Guy is a single-weight font (only 400). Browsers synthesize a fake bold by smearing the glyphs — the logo looks muddy/thick compared to proper Luckiest Guy rendering.

## Where

- `frontend/styles.css` line 192: `.logo-text { font-family: var(--font-display); font-weight: 700; }`

## Fix

Change `font-weight: 700` to `font-weight: 400` (or just remove the declaration — 400 is the default).

## Why it matters

The logo is the first thing users see. Faux-bolding makes it look cheap/blurry. The brand identity suffers on every single page load.

## Not a dupe of

- DQ-021 (canvas bold on Luckiest Guy) — that's about canvas `ctx.font` draws, not CSS
