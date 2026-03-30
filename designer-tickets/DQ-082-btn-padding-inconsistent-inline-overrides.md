# DQ-082: btn-chunky vs btn-primary base padding mismatch + 6 inline overrides

**Priority**: P2 — design consistency
**Category**: Component / Tokens
**Files**: `frontend/styles.css:755,783`, `frontend/pricing.html:65,121-122,212,335`, `frontend/agents.html:1732-1733,1757`

## Problem

The two primary button classes have different base paddings with no documented reason:
- `.btn-chunky`: `padding: 6px 14px;` (styles.css line 755)
- `.btn-primary`: `padding: 6px 16px;` (styles.css line 783)

Additionally, 6+ inline style overrides scatter custom padding across pages:

| File | Line | Override | Context |
|------|------|----------|---------|
| pricing.html | 121-122 | `padding: 12px 0;` | Full-width plan CTA |
| pricing.html | 65 | `padding: 10px 0;` | Mobile plan CTA |
| pricing.html | 212 | `padding:6px 16px;` | Manage Subscription |
| pricing.html | 335 | `padding:8px 14px;` | Apply promo code |
| agents.html | 1732-1733 | `padding:5px 12px;` | Generate Briefing |
| agents.html | 1757 | `padding:8px 20px;` | Unlock Elite CTA |

The inline overrides are ungoverned — no pattern, no size scale, no documentation.

## Fix

1. Unify base padding: `.btn-chunky` and `.btn-primary` should share the same base padding (suggest `6px 16px`)
2. Add size variants as CSS classes instead of inline styles:
   - `.btn-sm`: `padding: 5px 12px;`
   - `.btn-lg`: `padding: 12px 24px;`
   - `.btn-full`: `padding: 12px 0; width: 100%;`
3. Replace all 6 inline padding overrides with the appropriate size class

## Why It Matters

Inconsistent button sizing breaks visual rhythm. Two buttons side-by-side with 14px and 16px horizontal padding look unintentionally different. Inline overrides make the design system ungovernable.

## Verification

Grep `padding` inside any element with `btn-chunky` or `btn-primary` class. All should use the CSS class padding or a documented size variant — zero inline overrides.
