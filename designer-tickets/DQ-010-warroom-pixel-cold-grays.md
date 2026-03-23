# DQ-010: Situation Room pixel engine uses 20+ cold gray hex values

**Priority**: P3 — visual warmth in premium feature
**Category**: Color warmth
**Files**: `frontend/warroom.js:418-651` (pixel drawing functions)

## Problem

DESIGN.md says "Cold grays anywhere — even dark mode stays warm (brown, not gray)."

The pixel engine uses 20+ cold gray hex values for furniture, devices, and effects:
- `#333` (6 instances) — monitors, keyboards, bookshelves
- `#555` (2 instances) — monitor bezels, cabinet
- `#666` (2 instances) — whiteboard lines
- `#888` (2 instances) — monitor screens, handles
- `#aaa` (1 instance) — keyboard base
- `#ccc` (2 instances) — coffee steam
- `#ddd` (2 instances) — steam, particles

Phase A notes said "warroom.js pixel art exempted" but the design guide is clear: no cold grays. Pixel art furniture can use warm espresso variants instead:
- `#333` -> `#2d1f14` (espresso)
- `#555` -> `#5c4a3d` (ink-medium)
- `#888` -> `#8a7565` (ink-light)
- `#ccc`/`#ddd` -> `#c4b5a5`/`#ede0cf` (ink-faint/sand)

## Fix

Replace cold grays with warm brown equivalents in the pixel drawing calls. The furniture should feel like it belongs in an espresso-toned room, not a cold office.

## Verification

Open the Situation Room. Furniture, monitors, and effects should feel warm-toned, consistent with the espresso aesthetic.
