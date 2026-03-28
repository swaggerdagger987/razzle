---
id: S3-061
severity: S3
confidence: HIGH
category: design
source: DQ-293
status: OPEN
---

# --ink-faint dashed borders invisible in dark mode

## Root Cause

Multiple elements use `border: 2px dashed var(--ink-faint)` for visual dividers. In dark mode, `--ink-faint` (#3d2e22) is very close to `--bg` (#2d1f14), making dashed borders nearly invisible. This affects section dividers, tier breaks, and decorative borders throughout the site.

## Fix

Define a dark-mode-specific border color that provides adequate contrast:
```css
[data-theme="dark"] { --border-dashed: var(--ink-light); }
```

Or override individually where dashed borders are used.

## Files

- Sitewide — any element using `border: dashed var(--ink-faint)` in dark mode

## Acceptance Criteria

- Dashed borders visible in both light and dark mode
- Adequate contrast (at least 3:1 against background)
