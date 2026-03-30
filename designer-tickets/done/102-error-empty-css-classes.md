<!-- PM: ready -->
---
id: DES-442a
parent: 442 (Error/Empty State Epic)
priority: P1
area: frontend/styles.css
section: shared CSS
type: visual differentiation
status: open
---

# Add shared .panel-error and .panel-empty CSS classes

**File**: `frontend/styles.css`

## What to do

Add two distinct visual states for panels:

1. `.panel-error` — red-tinted left border, retry-friendly layout
2. `.panel-empty` — neutral, hint text, filter suggestion

```css
.panel-error {
  border-left: 4px solid var(--red, #e74c3c);
  background: var(--card-bg);
  padding: 24px;
  text-align: center;
  font-family: var(--font-hand);
}
.panel-error button { margin-top: 12px; }

.panel-empty {
  padding: 24px;
  text-align: center;
  color: var(--ink-light);
  font-family: var(--font-hand);
}
.panel-empty .hint {
  display: block;
  margin-top: 8px;
  font-size: 0.9em;
  opacity: 0.7;
}
```

## Root cause

This is the foundation fix for a 3-ticket root cause cluster:
- **001** (P0): empty catch handlers → silent failures (fix first)
- **102** (this): CSS classes to distinguish error from empty
- **103-105**: apply distinction across all panels

Also absorbs DES-444 (retry buttons) — retry is part of the error state.

## Accept when

- `.panel-error` and `.panel-empty` classes exist in styles.css
- Visually distinct (error = red accent + retry, empty = neutral + hint)
