---
id: DQ-041
priority: P1
category: dark-mode
page: pricing.html
status: open
---

# Pricing dark mode — comparison table text barely readable

## What's wrong
The feature comparison table on pricing.html has near-invisible text in dark mode. Three color values are too faint against `--bg` (#2d1f14):

- **Feature names** (`td:first-child`): `var(--ink-medium)` = #c4b5a5 — marginal contrast
- **`.no` cells** (dashes): `var(--ink-light)` = #a89888 — very low contrast
- **`.group-row` section headers**: `var(--ink-light)` = #a89888 — very low contrast

This is the conversion-critical pricing page. Users deciding whether to upgrade can't read the feature matrix.

## Evidence
- Screenshot: pricing dark mode scrolled to comparison table
- Code verified: pricing.html lines 169-183 have dark mode overrides, but `.no` and `.group-row` cells use `--ink-light` which maps to #a89888 in dark mode

## Fix
In pricing.html dark mode CSS (lines 169-183):
```css
[data-theme="dark"] .feature-matrix .no { color: var(--ink-medium); }
[data-theme="dark"] .feature-matrix .group-row td { color: var(--ink); font-weight: 700; }
[data-theme="dark"] .feature-matrix td:first-child { color: var(--ink); }
```

Promote feature names to `--ink` (#ede0cf) for full readability. Promote `.no` cells to `--ink-medium` (#c4b5a5). Promote group headers to `--ink` with bold weight.

## Files
- `frontend/pricing.html` lines 169-183 (dark mode CSS block)
