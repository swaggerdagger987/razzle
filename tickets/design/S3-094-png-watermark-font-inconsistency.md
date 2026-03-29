---
id: S3-094
severity: S3
confidence: HIGH
category: design
source: functional-qa/flows.md flow #54 (P2: watermark font inconsistency Caveat vs Space Mono)
status: OPEN
---

# PNG export watermark uses inconsistent fonts across pages

## Root Cause

Export/screenshot functions across 15+ pages each hardcode their own watermark font. Two patterns exist:

**Caveat** (matches app.js default at line 545):
- `frontend/aging.html:785-788`
- `frontend/airyards.html:720-722`
- `frontend/awards.html:644-646`
- `frontend/breakouts.html:661-663`
- `frontend/buysell.html:745-747`
- `frontend/app.js:545` (shared export helper)

**Space Mono** (overrides app.js default):
- `frontend/advantage.html:314-316`
- `frontend/archetypes.html:422-424`
- `frontend/auction.html:529-531`
- `frontend/breakdown.html:709-729`
- `frontend/drops.html` (inline)
- `frontend/dualthreat.html` (inline)
- `frontend/gamescript.html` (inline)
- `frontend/garbagetime.html` (inline)
- `frontend/snapefficiency.html` (inline)
- `frontend/stacks.html` (inline)

The global `app.js` export function uses Caveat, but many individual page exports override it with Space Mono, creating visual inconsistency in exported PNGs.

## Fix

Standardize on **Caveat** (the app.js default and DESIGN.md handwritten annotation font). Replace all `bold 28px 'Space Mono', monospace` watermark fonts with `600 28px Caveat, cursive` to match the shared export helper.

## Files to Change

- All files listed above under "Space Mono" — update `ctx.font` in export functions to use Caveat

## Accept When

1. All exported PNGs use the same watermark font (Caveat)
2. Watermark is legible at all export sizes
3. No regression in watermark positioning or text rendering

## Do NOT Touch

- Watermark text content ("razzle.lol")
- Watermark positioning logic
- Data font rendering in canvas charts (those should remain Space Mono)
