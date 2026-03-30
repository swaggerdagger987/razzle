---
id: DQ-262
title: College/NCAA mode uses --pos-qb token instead of --blue — wrong semantic color
priority: P2
category: design-system
status: open
cycle: 36
---

## Problem

When the Lab switches to College/NCAA mode, several UI elements use `var(--pos-qb)` (QB position blue) instead of `var(--blue)` (NCAA accent blue). Per DESIGN.md: "Blue is NCAA color throughout" — NCAA content should use the semantic `--blue` token, not the position-specific `--pos-qb`.

Both resolve to `#5b7fff` today, but if QB position color ever changes, all NCAA styling would break. This is an architectural correctness issue.

## Evidence

`frontend/lab.html` — 5 instances:
- Line ~1792: `.college-view-btn.active { background: var(--pos-qb) }` — should be `var(--blue)`
- Line ~1797: `.toolbar { border-bottom-color: var(--pos-qb) }` — should be `var(--blue)`
- Line ~1802: `universe-toggle.active { background: var(--pos-qb) }` — should be `var(--blue)`
- Line ~1807: `screener-table th { border-bottom-color: var(--pos-qb) }` — should be `var(--blue)`
- Line ~1840: `.draft-badge { background: var(--pos-qb) }` — should be `var(--blue)`

## Fix

Find-and-replace in the college mode CSS block:
`var(--pos-qb)` -> `var(--blue)` (5 instances in college-mode-specific rules only)

## Files
- `frontend/lab.html` — 5 token swaps in college mode CSS

## Impact
Semantic token hygiene. If --pos-qb diverges from --blue in a future design iteration, all NCAA UI breaks silently.
