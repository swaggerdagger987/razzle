# S3-044: Dashboard and tiers row hover has no dark mode override

**Severity**: S3 (Low)
**Category**: design
**Source**: designer-tickets DQ-020
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/dashboard.html:145` and `frontend/tiers.html:139` — Row hover styles use hardcoded `rgba(217,119,87,0.05)` with no dark mode override. On dark backgrounds, this terracotta tint is nearly invisible.

```css
/* dashboard.html:145 */
.db-row:hover { background: rgba(217,119,87,0.05); }

/* tiers.html:139 (similar pattern) */
.tl-tier-row:hover { ... }
```

## Fix

Add dark mode overrides alongside the existing hover rules:

```css
.db-row:hover { background: rgba(217,119,87,0.05); }
[data-theme="dark"] .db-row:hover { background: rgba(237,224,207,0.08); }
```

Same pattern for tiers.html hover if applicable.

## Files to Change

- `frontend/dashboard.html:145` — add `[data-theme="dark"]` override
- `frontend/tiers.html` — add dark mode hover override if similar pattern exists

## Accept When

1. Dashboard rows have visible hover highlight in both light and dark mode
2. Tiers page rows have visible hover highlight in both modes
3. Hover color uses warm tones (sand in dark mode, terracotta in light)

## Do NOT Touch

- Row content or layout
- Light mode hover opacity
