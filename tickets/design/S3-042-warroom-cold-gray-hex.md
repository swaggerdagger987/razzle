# S3-042: Warroom pixel engine uses 20+ cold gray hex values

**Severity**: S3 (Low)
**Category**: design
**Source**: designer-tickets DQ-010
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/warroom.js:418-651` — The Situation Room pixel engine uses 20+ cold gray hex values (e.g., `#333`, `#555`, `#666`, `#888`, `#999`, `#aaa`, `#ccc`) for furniture, floor tiles, and UI elements. These are pure neutral grays that feel cold against the warm espresso/sand palette.

The Situation Room IS always dark by design, but it should use warm brown-tinted grays that match the espresso theme, not cold neutral grays.

**Scope**: This affects canvas-drawn pixel art (tiles, furniture, walls). Since these are canvas hex values, they cannot use CSS variables directly — they need to be warm-brown hex equivalents.

## Fix

Replace cold grays with warm espresso-tinted equivalents:
- `#333` → `#2d1f14` (espresso dark)
- `#555` → `#4a3828` (warm medium-dark)
- `#666` → `#5c4a3d` (ink-medium equivalent)
- `#888` → `#7a6555` (warm medium)
- `#999` → `#8a7565` (ink-light equivalent)
- `#aaa` → `#a89585` (warm light)
- `#ccc` → `#c4b5a5` (ink-faint equivalent)

## Files to Change

- `frontend/warroom.js:418-651` — replace 20+ cold gray hex values with warm equivalents

## Accept When

1. No pure neutral gray hex values in the pixel engine tile/furniture code
2. All grays are warm brown-tinted
3. Visual check: Situation Room pixel art feels warm, not cold/clinical
4. Pixel art is still visually distinct (enough contrast between shades)

## Do NOT Touch

- Canvas rendering logic
- Sprite coordinates or animation
- Agent AI state machine
