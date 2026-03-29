---
id: S3-064
severity: S3
confidence: HIGH
category: design
source: DQ-497
status: OPEN
---

# 60+ hardcoded rgba(217,119,87,...) hover tint not tokenized as CSS variable

## Root Cause

60+ instances of `rgba(217,119,87,0.05)` to `rgba(217,119,87,0.15)` used for hover/active states across CSS and JS files. This is the terracotta orange in RGBA form, hardcoded instead of using a CSS variable. Won't adapt to dark mode.

## Fix

Define a hover tint CSS variable:
```css
:root { --hover-tint: rgba(217,119,87,0.08); }
[data-theme="dark"] { --hover-tint: rgba(217,119,87,0.15); }
```

Replace all hardcoded `rgba(217,119,87,...)` with `var(--hover-tint)`.

## Files

- `frontend/lab-panels.css` — highest concentration
- Standalone HTML pages
- `frontend/lab.html`, `frontend/lab.js`, `frontend/charts.js`

## Acceptance Criteria

- All orange hover tints use a CSS variable
- Hover effect visible in both light and dark mode
