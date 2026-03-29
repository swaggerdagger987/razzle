---
id: S3-072
severity: S3
confidence: HIGH
category: a11y
source: DQ-164+205+210+222+256+297+298+306+312+315
status: OPEN
---

# ARIA labels missing — batch of 10 form control and interactive element types

## Root Cause

Multiple interactive elements lack accessible labels:

1. `frontend/league-intel.html` — email input missing `autocomplete="username"` (DQ-164)
2. `frontend/formulas.js` — formula builder select elements have no `aria-label` (DQ-205)
3. `frontend/app.js` — nav user dropdown has zero ARIA attributes (DQ-210)
4. `frontend/lab-panels.js` — panel search inputs missing `aria-label` (DQ-222)
5. `frontend/index.html` — mini-screener tabs lack `role="tablist"` / `role="tab"` (DQ-256)
6. `frontend/lab.js` — position filter chips are `<span onclick>` not `<button>` (DQ-297)
7. `frontend/lab.js` — filter select elements missing `aria-label` (DQ-298)
8. `frontend/lab.js` — number inputs missing `inputmode="numeric"` (DQ-306)
9. Standalone pages — season select elements missing `aria-label` (DQ-312)
10. `frontend/index.html` — mini-screener sort headers have no `aria-sort` (DQ-315)

These extend beyond S3-021 (which covers panel form controls) to include Lab UI, nav, and mini-screener elements.

## Fix

Add appropriate `aria-label`, `role`, and `inputmode` attributes to each element type.

## Files

- `frontend/league-intel.html` — email input
- `frontend/formulas.js` — formula selects
- `frontend/app.js` — nav dropdown
- `frontend/lab-panels.js` — search inputs
- `frontend/index.html` — mini-screener tabs and sort
- `frontend/lab.js` — position chips, filters, number inputs
- Standalone pages — season selects

## Acceptance Criteria

- All form controls have accessible names (aria-label or visible label)
- Interactive tabs have role="tab" / role="tablist"
- Number inputs use inputmode="numeric"
- Sort columns announce sort state via aria-sort
