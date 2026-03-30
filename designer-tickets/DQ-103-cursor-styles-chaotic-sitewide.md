# DQ-103: Cursor styles chaotic — 371 cursor:pointer across 82 files, only 5 cursor:not-allowed

**Priority**: P2
**Category**: Design system consistency
**Severity**: Medium — inconsistent interactive affordances, disabled states not communicated
**Evidence**: Code search — 371 `cursor:pointer` across 82 files; only 5 `cursor:not-allowed` (in agents.html, lab-panels.css, lab.html, styles.css)

## What's wrong

1. **Massive duplication**: 371 instances of `cursor:pointer` scattered across 82 files. Most are inline styles on `<div>`, `<span>`, and `<td>` elements — these should use CSS classes or semantic buttons instead.
2. **Disabled states invisible**: Only 5 instances of `cursor:not-allowed` in the entire codebase. Locked Pro panels, disabled filters, unavailable actions show pointer cursor even when they can't be clicked.
3. **lab.html alone**: 27 inline `cursor:pointer` instances on divs/spans that act as buttons.
4. **lab-panels.css**: 73 instances — the largest single source.

## Where

Top offenders by file:
- `frontend/lab-panels.css` — 73 instances
- `frontend/lab.html` — 27 instances (inline)
- `frontend/lab.js` — 19 instances (inline DOM creation)
- `frontend/agents.html` — 14 instances (inline)
- `frontend/league-intel.html` — 12 instances (inline)

## Fix

1. Add a global rule in `styles.css`: `[role="button"], .clickable { cursor: pointer; }` — then remove inline cursor:pointer from elements that already have role="button"
2. Add `cursor: not-allowed` to all `.pro-locked`, `.disabled`, `[disabled]`, `.btn:disabled` selectors in styles.css
3. Migrate inline `cursor:pointer` on divs to use `.clickable` class or convert to `<button>` elements

Start with step 2 (disabled states) — highest UX impact, smallest change.

## Verification

Click a Pro-locked panel — cursor should show not-allowed, not pointer.
