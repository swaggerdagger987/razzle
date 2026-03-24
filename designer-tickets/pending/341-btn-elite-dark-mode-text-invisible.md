# DQ-341: .btn-elite missing dark mode text color — pricing page

**Priority**: P2
**Category**: Dark Mode — Pricing
**File**: frontend/pricing.html, lines 165-166

## Problem

`.btn-elite` has `background: var(--purple)` but no explicit `[data-theme="dark"]` override for text color. In dark mode, if `var(--text-on-accent)` resolves to a color close to purple, the button text becomes unreadable.

Compare with `.btn-primary` which has an explicit dark mode override at styles.css:1647:
```css
[data-theme="dark"] .btn-primary { color: var(--bg); }
```

`.btn-elite` has no equivalent rule.

Also: `.btn-elite:hover` uses `box-shadow: 3px 3px 0 var(--purple)` — should be `6px 6px 0` per DQ-337, but the dark mode text issue is higher priority.

## Fix

Add to pricing.html style block (after line 183):
```css
[data-theme="dark"] .btn-elite { color: var(--bg); }
```

This matches the pattern used for `.btn-primary` dark mode.
