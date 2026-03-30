---
id: DES-007
priority: P0
area: sitewide (OG image)
status: open
created: 2026-03-22
---

# DES-007: OG image says "bloomberg terminal" — wrong tagline, blocks Twitter launch quality

## What's Wrong

The OpenGraph image at `frontend/assets/og-image.png` (used on every Twitter/Reddit/Discord link share) says:

> **RAZZLE**
> the free bloomberg terminal for fantasy football
> razzle.lol
> built different

Three problems:

1. **"bloomberg terminal"** is the OLD brand positioning. Current DESIGN.md and North Star say **"research lab"** — "The fantasy football research lab. Forever free."
2. **"built different"** is generic and overused. Razzle's brand voice is specific: "The Screener is forever free. The intelligence is what you pay for."
3. **No tiger mascot or personality** — the image is bland text-on-sand. For a brand built on "Sunday comic strip energy," this is lifeless. Every competitor's OG image has more personality.

## Why It Matters

This image appears on:
- Every tweet linking to razzle.lol (Twitter launch is NOW — Phase 1)
- Every Reddit post linking to any razzle.lol page
- Every Discord/Slack/iMessage link preview
- Every search engine result card

It's the single most-viewed brand asset during the Twitter launch. And it communicates the wrong product identity.

## Fix

Regenerate `frontend/assets/og-image.png` (1200x630) with:
- Tiger emoji or mascot art
- "RAZZLE" in Luckiest Guy (display font)
- Tagline: "The fantasy football research lab. Forever free."
- Subtitle: "100+ stat columns. Custom formulas. AI agents with league context."
- `razzle.lol` domain
- Sand background (#ede0cf), terracotta border (#d97757), espresso text (#2d1f14)

Also regenerate `frontend/assets/og-image.svg` (source file).

## Files

- `frontend/assets/og-image.png`
- `frontend/assets/og-image.svg`
