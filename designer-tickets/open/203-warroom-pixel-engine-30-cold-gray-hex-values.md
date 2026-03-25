<!-- PM: ready -->
# DQ-416: Warroom.js pixel engine uses 30+ cold gray hex values

**Priority**: P2
**Category**: Visual Consistency / Design System
**Files**: `frontend/warroom.js`

## Problem

The Situation Room pixel engine draws furniture, decorations, and UI elements using 30+ cold gray hex values: `#333`, `#555`, `#666`, `#888`, `#999`, `#aaa`, `#ccc`, `#ddd`, `#111`.

DESIGN.md rule: **"NO cold grays anywhere — even dark mode stays warm (brown, not gray)."**

The Situation Room is always dark mode (`--bg-ink: #1a110a`). All grays should be warm espresso variants.

## Instances (sample)

| Line | Current | Context | Should Be |
|------|---------|---------|-----------|
| 418-420 | `#333`, `#555` | Mouse cursor pixels | `#2d1f14`, `#5c4a3d` |
| 456-457 | `#666` | Paper line decoration | `#5c4a3d` or `#8a7565` |
| 467 | `#333` | Coffee machine spout | `#2d1f14` |
| 473-474, 479 | `#ccc`, `#ddd` | Steam animation | `#c4b5a5` |
| 572 | `#fff` | Sparkle effect | `#ede0cf` or `#f7efe5` |
| 616-619 | `#aaa`, `#333` | Scoreboard | `#8a7565`, `#2d1f14` |
| 634-641 | `#333`, `#111` | Phone pixels | `#2d1f14` |
| 650-651 | `#333`, `#888` | Desk drawer | `#2d1f14`, `#5c4a3d` |
| 1039-1040 | `#333`, `#999` | Typing indicator dots | `#2d1f14`, `#5c4a3d` |
| 1048 | `#888` | Thinking bubble | `#5c4a3d` |
| 1070-1071 | `#ccc` | Eating animation | `#c4b5a5` |
| 1251, 1260 | `#666`, `#ccc` | Agent HUD dots/labels | `#5c4a3d`, `#c4b5a5` |
| 1328, 1374, 1405 | `#666` | STATE_COLORS idle | `#5c4a3d` |

Also: palette constants (line 83-84) use `#ffffff` where `#f7efe5` (warm card) would be correct.

## Fix

Replace all cold grays with their warm espresso equivalents from the design system:
- `#111` / `#333` → `#2d1f14` (espresso)
- `#555` / `#666` → `#5c4a3d` (ink medium)
- `#888` / `#999` → `#8a7565` (ink light)
- `#aaa` / `#ccc` / `#ddd` → `#c4b5a5` (ink faint)
- `#fff` / `#ffffff` → `#ede0cf` or `#f7efe5` (sand/card)
