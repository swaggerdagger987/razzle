---
id: S3-062
severity: S3
confidence: HIGH
category: design
source: DQ-294
status: OPEN
---

# Diff mode banner invisible in dark mode

## Root Cause

The pin diff mode banner in the Lab uses colors that don't adapt to dark mode. The banner text and background become indistinguishable when dark theme is active.

## Fix

Add dark mode override for the diff banner:
```css
[data-theme="dark"] .diff-banner { background: var(--orange); color: var(--bg); }
```

## Files

- `frontend/lab.js` — diff banner creation (inline styles)
- `frontend/lab.html` — if CSS override exists

## Acceptance Criteria

- Diff mode banner clearly visible in both light and dark mode
