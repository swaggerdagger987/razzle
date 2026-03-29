---
id: S2-063
severity: S2
category: design
finding_ref: DQ-491
confidence: HIGH
---

# S2-063: Column Stats popover has no dark mode overrides

## Root Cause

`frontend/lab.html:1102-1130` -- The `.colstats-popover` CSS block uses
CSS variables (`var(--bg-card)`, `var(--ink)`, `var(--orange)`, etc.) which
is correct for light mode. However, there are zero `[data-theme="dark"]`
overrides for any colStats classes.

The popover's histogram bars, background, borders, and text colors are
defined only for light mode. In dark mode, the global CSS variable swap
partially works but the histogram bars and specific elements lack targeted
dark-mode rules, creating WCAG contrast failures.

Key missing overrides:
- `.colstats-popover` background and border
- `.colstats-bar` fill colors
- `.colstats-label` text color
- `.colstats-value` text color

## What to Fix

Add dark mode overrides in `lab.html` near the existing colStats CSS:

```css
[data-theme="dark"] .colstats-popover {
  background: var(--bg-card);
  border-color: var(--ink-faint);
}
[data-theme="dark"] .colstats-bar {
  background: var(--orange);
}
[data-theme="dark"] .colstats-label,
[data-theme="dark"] .colstats-value {
  color: var(--ink);
}
```

## Files to Change

- `frontend/lab.html` -- add `[data-theme="dark"]` overrides for colStats classes

## Acceptance Criteria

- [ ] Toggle dark mode -- colStats popover background matches dark theme
- [ ] Histogram bars visible with sufficient contrast in dark mode
- [ ] All text in popover readable (4.5:1 contrast ratio minimum)
- [ ] Light mode appearance unchanged

## Do NOT

- Do not change the popover's JavaScript logic
- Do not add new CSS classes -- just add dark mode selector overrides
