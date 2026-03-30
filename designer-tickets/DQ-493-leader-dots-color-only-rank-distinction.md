---
id: DQ-493
title: Leader dots use same Unicode glyph — rank distinction is color-only
severity: P2
status: open
component: Lab Screener
phase: Phase 122
---

## Problem

The stat leader indicators (Phase 122) render gold/silver/bronze dots using the same Unicode character `&#9679;` (filled circle) for all three ranks. While `title` attributes ("1st", "2nd", "3rd") exist for screen readers, sighted users with color vision deficiency cannot distinguish rank because the ONLY visual difference is color.

WCAG 1.4.1: "Color is not used as the only visual means of conveying information."

## Location

- `frontend/lab.js:5458-5463` — `getLeaderDot()` function

```js
if (rank === 1) return '<span class="leader-dot leader-gold" title="1st">&#9679;</span>';
if (rank === 2) return '<span class="leader-dot leader-silver" title="2nd">&#9679;</span>';
if (rank === 3) return '<span class="leader-dot leader-bronze" title="3rd">&#9679;</span>';
```

## Fix

Use distinct Unicode glyphs per rank:

```js
if (rank === 1) return '<span class="leader-dot leader-gold" title="1st">&#9733;</span>';   // ★ star
if (rank === 2) return '<span class="leader-dot leader-silver" title="2nd">&#9670;</span>';  // ◆ diamond
if (rank === 3) return '<span class="leader-dot leader-bronze" title="3rd">&#9679;</span>';  // ● circle
```

## Acceptance Criteria

- [ ] Each rank uses a visually distinct glyph
- [ ] Title attributes remain for screen readers
- [ ] Glyphs are legible at 7px font-size
