---
id: S2-066
severity: S2
confidence: HIGH
category: design
source: DQ-041,DQ-100
status: OPEN
---

# Pricing dark mode — comparison table and FAQ unreadable contrast

## Root Cause

`frontend/pricing.html:173-174` dark mode overrides:

```css
[data-theme="dark"] .feature-matrix td { color: var(--ink-medium); }
[data-theme="dark"] .feature-matrix td:first-child { color: var(--ink-medium); }
```

`--ink-medium` (#c4b5a5) on `--bg` (#2d1f14) = marginal contrast. The `.no` cells (dashes) and `.group-row` section headers use `--ink-light` (#a89888) = very low contrast (~2.5:1, needs 4.5:1).

This is the conversion-critical pricing page. Users deciding whether to upgrade can't read the feature matrix.

## Fix

```css
[data-theme="dark"] .feature-matrix .no { color: var(--ink-medium); }
[data-theme="dark"] .feature-matrix .group-row td { color: var(--ink); font-weight: 700; }
[data-theme="dark"] .feature-matrix td:first-child { color: var(--ink); }
```

## Files

- `frontend/pricing.html:169-183` — dark mode CSS block

## Acceptance Criteria

- All comparison table text readable in dark mode (4.5:1 contrast ratio)
- Feature names, dashes, and group headers all legible
