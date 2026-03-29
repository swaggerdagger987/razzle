---
id: S2-092
severity: S2
confidence: HIGH
category: dark-mode
source: DQ-225+278+285+187
status: OPEN
---

# 4 pages have zero inline dark mode CSS overrides

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

These 4 pages have **absolutely zero** `[data-theme="dark"]` CSS rules, no theme-aware code, and only a basic `<meta name="theme-color" content="#ede0cf">` tag:

1. `frontend/404.html` — no dark mode CSS, no theme-aware JS
2. `frontend/about.html` — no dark mode CSS, no theme-aware JS
3. `frontend/prompts.html` — no dark mode CSS, no theme-aware JS
4. `frontend/player.html` — no dark mode CSS, no theme-aware JS

**Note**: Original ticket listed `tools.html` but investigation found `player.html` also lacks dark mode entirely. `tools.html` status should be re-verified.

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
