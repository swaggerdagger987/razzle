# S3-003: Hardcoded text-shadow rgba — won't adapt in dark mode

**Severity**: S3 (Low)
**Category**: design
**Source**: DESIGN-QA-TICKETS.md DES-408
**Found**: 2026-03-25
**Status**: OPEN

## Root Cause

Four files use hardcoded espresso RGB in text-shadow. Values are correct for light mode but invisible in dark mode (espresso shadow on espresso background).

- `frontend/lab-panels.css:430` — `text-shadow: 2px 2px 0 rgba(45,31,20,0.2);`
- `frontend/fptsbreakdown.html:215` — `text-shadow: 0 0 2px rgba(45,31,20,0.5);`
- `frontend/percentiles.html:226` — `text-shadow: 0 1px 2px rgba(45,31,20,0.3);`
- `frontend/tiers.html:146` — `text-shadow: 2px 2px 0 rgba(45,31,20,0.2);`

## Fix

Define a `--shadow-text` CSS variable that flips in dark mode:
```css
:root { --shadow-text: rgba(45,31,20,0.2); }
[data-theme="dark"] { --shadow-text: rgba(237,224,207,0.15); }
```

Then replace hardcoded rgba with `var(--shadow-text)`.

## Files to Change

- `frontend/styles.css` — add `--shadow-text` variable
- `frontend/lab-panels.css:430`
- `frontend/fptsbreakdown.html:215`
- `frontend/percentiles.html:226`
- `frontend/tiers.html:146`

## Accept When

Text shadows adapt correctly in dark mode (visible but subtle).
