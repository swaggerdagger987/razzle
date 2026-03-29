---
id: S1-001
severity: S1
category: design
title: "Dark mode --ink-light diverges from DESIGN.md spec"
status: open
audit: DEEP-AUDIT-TICKETS.md
---

# S1-001: Dark mode --ink-light color diverges from DESIGN.md

## Finding

In dark mode, `--ink-light` is `#a89888`. DESIGN.md specifies `#8a7565`.

## Root Cause

**File: `frontend/styles.css:85`**

```css
[data-theme="dark"] {
  --ink-light: #a89888;  /* line 85 — should be #8a7565 per DESIGN.md */
}
```

Light theme at line 25: `--ink-light: #6d5c4e` (correct per design).

## Fix

Change `frontend/styles.css:85` from `#a89888` to `#8a7565`.

## Impact

Labels, metadata, timestamps across all 75 pages in dark mode have slightly wrong contrast. Minor visual inconsistency.

## Acceptance Criteria

- [ ] `--ink-light` in `[data-theme="dark"]` matches DESIGN.md value `#8a7565`
- [ ] Verify contrast ratio is still accessible (WCAG AA) against dark background
