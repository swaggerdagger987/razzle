---
id: S2-092
severity: S2
confidence: HIGH
category: dark-mode
source: DQ-225+278+285+187
status: OPEN
---

# 4 pages have zero inline dark mode CSS overrides

## Root Cause

These pages rely entirely on shared `styles.css` dark mode rules and have no page-specific `[data-theme="dark"]` overrides for their custom styled elements:

1. `frontend/prompts.html` — 0 dark mode rules
2. `frontend/tools.html` — 0 dark mode rules
3. `frontend/404.html` — 0 dark mode rules
4. `frontend/about.html` — 0 dark mode rules

Compare with `frontend/pricing.html` which has 15 inline dark mode rules. Pages with custom card styles, backgrounds, or text colors need page-specific dark overrides.

Note: This is DISTINCT from S2-073 (8 newer pages phases 131-140) — these are different pages.

## Fix

Audit each page's custom styles and add `[data-theme="dark"]` overrides for:
- Card backgrounds
- Text colors on custom elements
- Border colors
- Any hardcoded rgba values

## Files

- `frontend/prompts.html`
- `frontend/tools.html`
- `frontend/404.html`
- `frontend/about.html`

## Acceptance Criteria

- Each page has dark mode overrides for all custom styled elements
- No text becomes invisible or unreadable in dark mode
- Card backgrounds use dark theme tokens
