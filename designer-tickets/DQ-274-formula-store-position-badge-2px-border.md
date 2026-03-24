# DQ-274: Formula store position badge uses 2px border — should be 3px

**Priority**: P2 — Off-spec border thickness on every formula card
**Category**: Design Token / Component
**Severity**: MEDIUM — Visually thinner than all other badges in the design system

## Problem

formula-store.js line 527 renders position badges with `border:2px solid var(--ink)`. The Razzle design system uses 3px borders for all chunky elements (cards, buttons, badges). DES-054 (done) fixed the border-radius from 4px to 8px, but the border thickness was left at 2px.

```javascript
return `<span style="...border:2px solid var(--ink); border-radius:8px;...">`;
```

Compare to Lab screener position badges which use `border:3px solid var(--ink)`.

## Fix

Change `border:2px` to `border:3px` at line 527:
```javascript
return `<span style="...border:3px solid var(--ink); border-radius:8px;...">`;
```

## Files
- `frontend/formula-store.js` line 527
