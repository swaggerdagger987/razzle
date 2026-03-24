---
id: DQ-281
priority: P2
category: color warmth
status: open
---

# DQ-281: warroom.js DOM elements use '#666' cold gray fallback

## Problem

DESIGN.md: "Cold grays anywhere -- even dark mode stays warm (brown, not gray)."

Two DOM-creating lines in warroom.js use `'#666'` as a fallback color on inline `style` attributes. These are NOT pixel art (exempted by DQ-010) -- they are visible UI span elements rendered in the agent roster panel.

## Where

| Line | Element | Current | Should be |
|------|---------|---------|-----------|
| 1374 | `<span class="roster-dot">` inline background | `STATE_COLORS[a.state] \|\| '#666'` | `STATE_COLORS[a.state] \|\| 'var(--ink-light)'` |
| 1405 | `dot.style.background` JS assignment | `STATE_COLORS[a.state] \|\| '#666'` | `STATE_COLORS[a.state] \|\| 'var(--ink-light)'` |

Also: line 1251 sets `let dotColor = '#666'` as default before the state machine, and line 1328 has `[STATE.IDLE]: '#666'` in the STATE_COLORS object. Both should be warm espresso equivalents.

## Fix

4 replacements in `frontend/warroom.js`:
- Line 1251: `'#666'` -> `'#8a7565'` (warm ink-light)
- Line 1328: `'#666'` -> `'#8a7565'`
- Line 1374: `'#666'` -> `'var(--ink-light)'`
- Line 1405: `'#666'` -> `'var(--ink-light)'`

## Not a dupe of

DQ-010 covers pixel art cold grays in canvas drawing code. These are DOM element inline styles -- different scope, different fix pattern.
