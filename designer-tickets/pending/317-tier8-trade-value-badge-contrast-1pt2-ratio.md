# DES-317: Trade value tier-8 badge has ~1.2:1 contrast ratio (SEVERE)

**Priority**: P1
**Area**: lab-panels.css (line 587)
**Cycle**: 30

## Problem

The tier-8 "Cut Bait" badge in the Dynasty Trade Value Chart panel is nearly invisible:

```css
.tv-tier-num.t8 { background: var(--ink-faint); color: var(--ink-medium); }
```

- `--ink-faint` = `#c4b5a5` (background)
- `--ink-medium` = `#5c4a3d` (text)
- **Contrast ratio: ~3.3:1** — fails WCAG AA for normal text (needs 4.5:1)

But the real issue is the visual weight. The badge sits next to tiers 1-7 which all use strong accent backgrounds (green, blue, orange, purple) with contrasting text. Tier 8 uses two muted browns that visually merge. Users scanning the tier list literally skip over tier 8.

## Fix

Use a stronger contrast pair that stays on-brand:

```css
.tv-tier-num.t8 { background: var(--ink-light); color: var(--bg-card); }
```

This gives espresso-on-cream (~5.5:1 contrast) and visually signals "bottom tier" without being invisible.

## Why This Matters

The trade value chart is a core dynasty tool. Tier 8 ("Cut Bait") players are the ones users need to roster-cut — missing them because the badge blends into the background means missed decisions.
