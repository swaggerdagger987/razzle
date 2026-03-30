---
id: DQ-293
title: var(--ink-faint) dashed borders near-invisible in dark mode (6 components)
priority: P2
category: dark mode / contrast
status: open
cycle: 39
---

## What's wrong

Six components use `border: 2px dashed var(--ink-faint)` as visual dividers. In dark mode:
- `--ink-faint` = `#5c4a3d`
- `--bg-card` = `#4a3728`

The contrast ratio between these two colors is approximately 1.3:1 — the dashed borders are effectively invisible. These are content dividers users rely on for visual hierarchy.

## Affected components

| Component | File:Line | Usage |
|-----------|-----------|-------|
| `.hover-card-note` | styles.css:1561 | Divider above player notes in hover cards |
| `.tag-picker-clear` | styles.css:1459 | Divider above "clear" option in tag picker |
| `.colstats-title` | lab.html:1107 | Divider below column stats popover title |
| `.colstats-hist-section` | lab.html:1115 | Divider above histogram in column stats |
| `.data-source-card` | about.html:113 | Divider between data source entries |
| `.prompt-text` | prompts.html:67 | Border around prompt code blocks |

None of these have `[data-theme="dark"]` overrides.

## Fix

Add a dark mode override that increases the border lightness:

```css
[data-theme="dark"] .hover-card-note,
[data-theme="dark"] .tag-picker-clear,
[data-theme="dark"] .colstats-title,
[data-theme="dark"] .colstats-hist-section {
  border-color: var(--ink-light);  /* #a89888 — visible on #4a3728 */
}
```

Or redefine `--ink-faint` in dark mode to a lighter value (currently `#5c4a3d`, could be `#6b5a4d`).

## Not a dupe of

- done/033 fixed `.diff-mode-label` white text and radius — different element
- DQ-098 fixed ink-light contrast + placeholders — different token (--ink-light, not --ink-faint)

## Files
- `frontend/styles.css` lines 1459, 1561
- `frontend/lab.html` lines 1107, 1115
- `frontend/about.html` line 113
- `frontend/prompts.html` line 67
