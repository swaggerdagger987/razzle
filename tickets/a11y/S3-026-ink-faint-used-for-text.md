# S3-026: --ink-faint used for informational text (1.5:1 contrast)

**Severity**: S3 (Low)
**Category**: a11y
**Source**: 2026-03-14-a11y-audit.md #15
**WCAG**: 1.4.3 (Contrast Minimum)
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`--ink-faint: #c4b5a5` on `--bg: #ede0cf` produces approximately 1.5:1 contrast ratio — far below the 4.5:1 minimum for normal text and even below the 3:1 minimum for large text.

`--ink-faint` is correctly used for decorative borders and dividers (1.5:1 is fine for non-text), but 4 instances use it for `color` on informational text:

1. `frontend/index.html:777` — "Situation Room — Live Preview" (11px, uppercase mono)
2. `frontend/index.html:786` — "your analysts are already working" (14px, Caveat)
3. `frontend/index.html:789` — "Demo — connect your Sleeper league..." (11px, uppercase mono)
4. `frontend/tradevalues.html:425` — "the number your leaguemates wish they had" (14px, Caveat)

These are all secondary/decorative labels, but they convey information a user would want to read.

## Fix

Replace `color:var(--ink-faint)` with `color:var(--ink-light)` on these 4 text elements:

```html
<!-- BEFORE -->
<div style="... color:var(--ink-faint); ...">Situation Room — Live Preview</div>
<!-- AFTER -->
<div style="... color:var(--ink-light); ...">Situation Room — Live Preview</div>
```

`--ink-light` (#8a7565) at ~2.9:1 is still below 4.5:1 AA for small text, but meets 3:1 for large text (14px Caveat may qualify). For the 11px mono labels, `--ink-medium` (#5c4a3d) would be needed for full AA compliance.

## Files to Change

- `frontend/index.html:777,786,789` — 3 inline style color values
- `frontend/tradevalues.html:425` — 1 inline style color value

## Accept When

1. Zero instances of `color:var(--ink-faint)` on text elements (text that conveys information)
2. `--ink-faint` only used for `border-color`, `background`, or purely decorative non-text elements
