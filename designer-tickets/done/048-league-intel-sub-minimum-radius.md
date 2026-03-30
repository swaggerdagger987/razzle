# DES-048: league-intel.html has 16+ sub-minimum border-radius instances

**Priority**: P1
**Area**: league-intel.html (Bureau of Intelligence)
**Found by**: Design QA Cycle 5

## Problem

league-intel.html has **16+ instances** of border-radius values below `--radius-sm` (8px) — split between CSS `<style>` block and JS-generated inline styles.

### In CSS (6 at 3px, 5 at 4px, 4 at 6px, 1 at 2px):
- Line 173: `.intel-stat-delta` — 3px
- Line 224/271: `.odds-bar-fill`, `.odds-bar-label` — 4px
- Line 372/396: `.trade-arrow-badge`, `.trade-stat-bar-fill` — 4px
- Line 443: `.pressure-bar-track` — 3px
- Line 449: `.pressure-bar-fill` — 2px
- Line 463: `.pressure-badge` — 3px
- Line 541/584: `.activity-badge`, `.h2h-bar-fill` — 6px
- Line 842: `.build-bar-fill` — 4px
- Line 908: `.power-rank-bar-fill` — 3px

### In JS-generated inline styles:
- Line 3308: Pro badge — `border-radius:3px`
- Line 5641: stacked bar div — `border-radius:4px`
- Line 6404/6430/6437: MC scenario selects — `border-radius:6px`
- Line 7369: "YOU" badge — `border-radius:3px`

## Conversion impact

Bureau is the conversion engine. These small badges and controls look inconsistent with the rest of the design system (which uses 8px/12px/20px tokens). The "YOU" badge is literally the first thing a connected user sees next to their name.

## Fix

1. CSS values: replace with `var(--radius-sm)` or `8px` (exception: bar fills inside tracks can stay small)
2. JS inline styles: replace `3px`/`4px`/`6px` with `8px`
