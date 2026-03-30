<!-- PM: ready -->
---
id: DES-442b
parent: 442 (Error/Empty State Epic)
priority: P1
area: frontend/lab-panels.js
section: error handling
type: visual differentiation
status: open
depends_on: DES-442a, ticket 001
---

# Differentiate error vs empty states in lab-panels.js

**File**: `frontend/lab-panels.js`

## What to do

After ticket 001 fills the empty catch handlers, upgrade ALL error displays in lab-panels.js:

- API failure → `.panel-error` class with `razzleError()` + retry button
- Empty results → `.panel-empty` class with filter hint text

Audit every `.lp-error` usage. Replace with the appropriate new class based on context.

## Accept when

- Error and empty states are visually distinguishable across all lab panels
- Error states include retry button
- Empty states include hint text ("try a different position or season")
- No `.lp-error` used for empty results

## Depends on

- Ticket 001 (empty catches must be filled first)
- Ticket 102 / DES-442a (CSS classes must exist)
