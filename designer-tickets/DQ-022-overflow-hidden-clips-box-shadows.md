# DQ-022: overflow:hidden clips 4px box-shadows on 8 lab-panel cards

**Priority**: P1 — Visible shadow clipping on 8 card types
**Category**: Layout / Spacing
**Severity**: HIGH — The design's signature "chunky shadow" is being clipped

## Problem

The design guide specifies `box-shadow: 4px 4px 0 var(--ink)` for cards. Eight card classes in lab-panels.css simultaneously set `overflow: hidden`, which clips the bottom-right 4px of the shadow.

## Files

All in `frontend/lab-panels.css`:

| Line | Class | Panel |
|------|-------|-------|
| 752 | `.pa-card` | Player Archetypes |
| 1894 | `.cc-card` | Consistency card |
| 1929 | `.py-card` | Proprietary card |
| 1968 | `.cs-card` | Card stock |
| 2005 | `.tp-card` | Target Premium |
| 2041 | `.dr-card` | Draft card |
| 2080 | `.gt-card` | Garbage Time |
| 3139 | `.fpb-card` | Fantasy PB card |

## Fix Options

**Option A** (preferred): Remove `overflow: hidden` from the card wrapper. If overflow was needed for internal content, add it to an inner `.card-body` element instead.

**Option B**: Add `margin-right: 4px; margin-bottom: 4px;` to give the shadow room. Less clean but non-breaking.

## Test

After fix, inspect any card in devtools — the bottom-right shadow should extend past the card border, not be cut off.
