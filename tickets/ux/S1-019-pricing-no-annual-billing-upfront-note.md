# S1-019: Pricing page lacks "billed annually upfront" clarification

**Severity**: S1 (Major)
**Category**: ux-flow
**Source**: Deep Audit 2026-03-28, finding S1-006

## Problem

The pricing page shows yearly plan prices with monthly equivalents but never states
that yearly plans are billed as a single upfront payment. Users see "$6.67/mo" for Pro
and "$12.50/mo" for Elite, which could be misread as monthly billing at a discounted rate.

## Root Cause

- `frontend/pricing.html:277-278` — Pro card shows `$79.99/yr` with subtext
  `that's $6.67/mo — save 33%` but no "billed annually" note
- `frontend/pricing.html:301-302` — Elite card shows `$149.99/yr` with subtext
  `that's $12.50/mo — save 37%` but no "billed annually" note
- `frontend/pricing.html:578` — JS only shows `'billed monthly'` when monthly is
  selected; no equivalent `'billed annually at $X'` text for yearly
- `frontend/pricing.html:539-540` — pricing data object has monthlyEquiv but no
  billing-cadence clarification text

## Expected

When yearly billing is selected, the interval line should read:
`$6.67/mo (billed annually at $79.99)` instead of just `that's $6.67/mo — save 33%`.

## Fix

1. In `pricing.html:278`, change subtext to include "(billed annually at $79.99)"
2. In `pricing.html:302`, change subtext to include "(billed annually at $149.99)"
3. In the JS toggle logic (~line 561-570), add `'billed annually'` text when yearly is active

## Scope

- 1 file: `frontend/pricing.html`
- ~3 line changes
