# DES-142: Tier sticker rotation 2deg instead of DESIGN.md's 3deg

**Priority:** P3 — Brand Consistency
**Component:** pricing.html, lab.html, lab.js, league-intel.html
**Affects:** Sticker/badge visual language

## Problem

DESIGN.md specifies tier stickers should use `rotate(3deg)` for the "slapped on, not placed" aesthetic. Five instances across four files use `rotate(2deg)` instead:

1. `pricing.html:99` — Plan badge sticker: `transform: rotate(2deg);`
2. `lab.html:2066` — A sticker badge: `transform: rotate(2deg);`
3. `league-intel.html:1545` — A sticker badge: `transform: rotate(2deg);`
4. `league-intel.html:3560` — Pressure map annotation: `transform:rotate(2deg);`
5. `lab.js:11690` — Competing status badge: `transform:rotate(2deg);`

Meanwhile, 10+ instances correctly use `rotate(3deg)` or `rotate(-3deg)`:
- `index.html:76`, `about.html:41`, `agents.html:38`, `compare.html:160` — all use `-3deg`
- `lab.js:7224`, `lab.js:8737`, `lab.js:11680`, `lab.js:12648` — all use `3deg` or `-3deg`

The inconsistency is subtle but breaks the visual rhythm — some stickers look slightly more tilted than others.

## Evidence

- `docs/DESIGN.md:161` — "Tier Stickers: slightly rotated (rotate(3deg)) — slapped on, not placed"
- 5 instances of `rotate(2deg)` (listed above)
- 10+ instances of `rotate(3deg)` or `rotate(-3deg)` (correct)

## Fix

Find and replace the 5 instances of `rotate(2deg)` with `rotate(3deg)` (or `rotate(-3deg)` where negative rotation is used for variation):

1. `pricing.html:99` — `rotate(2deg)` → `rotate(3deg)`
2. `lab.html:2066` — `rotate(2deg)` → `rotate(3deg)`
3. `league-intel.html:1545` — `rotate(2deg)` → `rotate(3deg)`
4. `league-intel.html:3560` — `rotate(2deg)` → `rotate(3deg)`
5. `lab.js:11690` — `rotate(2deg)` → `rotate(3deg)`

## Why it matters

Small brand consistency detail. The 3deg rotation is part of the "sticker aesthetic" that makes Razzle feel different from every dark-mode fintech dashboard. Getting every sticker to the same tilt creates visual rhythm.
