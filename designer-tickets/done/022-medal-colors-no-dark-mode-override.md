# DES-022: Gold/bronze medal colors hardcoded with no dark mode overrides

**Priority**: P2
**Area**: lab-panels.css
**Impact**: Medal badges (gold #ffd700, bronze #cd7f32) appear on stat leaders, weekly leaders, and record panels. They use hardcoded hex colors with no dark mode overrides and no CSS variables. In dark mode, gold badges may have reduced contrast, and the inconsistency breaks the design token pattern.

## The Problem

`frontend/lab-panels.css`:
- Line 2534: `.wkl-rank.top1 { background: #ffd700; color: var(--ink); }` — gold
- Line 2536: `.wkl-rank.top3 { background: #cd7f32; color: #fff; }` — bronze
- Line 3353: `.ld2-rank.gold { background: #ffd700; color: var(--ink); }` — gold
- Line 3355: `.ld2-rank.bronze { background: #cd7f32; color: #fff; }` — bronze
- Line 3478: `.rec-rank.bronze { color: #cd7f32; }` — bronze text

6 instances across 3 panel types. No CSS variables, no dark mode overrides.

## The Fix

Add CSS variables:
```css
:root {
  --medal-gold: #ffd700;
  --medal-silver: var(--ink-faint);
  --medal-bronze: #cd7f32;
}
```

Then use `var(--medal-gold)` etc. throughout, with dark mode overrides if needed for contrast.

## Why This Matters

Medals are a visual reward pattern — they make panels feel polished and data-rich. Inconsistent color management makes them a maintenance liability and creates dark mode contrast issues.
