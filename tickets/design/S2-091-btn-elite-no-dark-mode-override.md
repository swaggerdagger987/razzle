---
id: S2-091
severity: S2
confidence: HIGH
category: dark-mode
source: DQ-341
status: OPEN
---

# .btn-elite missing dark mode text color override — potentially invisible text

## Root Cause

`frontend/pricing.html:165-166`:

```css
.btn-elite { background: var(--purple); border-color: var(--ink); }
.btn-elite:hover { box-shadow: 3px 3px 0 var(--purple); }
```

No `[data-theme="dark"]` override exists for `.btn-elite`. Compare with `.btn-primary` which has a dark mode override at `frontend/styles.css:1705`:

```css
[data-theme="dark"] .btn-primary { color: var(--bg); }
```

`.btn-elite` has no equivalent rule. In dark mode, button text may become unreadable against the purple background depending on inherited text color.

## Fix

Add dark mode override to pricing.html style block:

```css
[data-theme="dark"] .btn-elite { color: var(--bg); }
```

## Files

- `frontend/pricing.html:165-166` — .btn-elite definition (no dark mode)
- `frontend/styles.css:1705` — .btn-primary dark mode (the pattern to follow)

## Acceptance Criteria

- .btn-elite text is readable in dark mode
- Follows same pattern as .btn-primary dark mode override
