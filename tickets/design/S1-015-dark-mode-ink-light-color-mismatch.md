---
id: S1-015
severity: S1
category: design
title: Dark mode --ink-light uses #a89888, DESIGN.md specifies #8a7565
source: deep-audit
status: open
---

## Problem

In dark mode, `--ink-light` is set to `#a89888` but DESIGN.md specifies `#8a7565` as a shared token (same in both light and dark). The current value is lighter and warmer than spec, affecting labels, metadata, and timestamps across all 75 pages in dark mode.

## Root Cause

**`frontend/styles.css:81`** — inside `[data-theme="dark"]` block:
```css
--ink-light: #a89888;
```

**`docs/DESIGN.md:58`** — specifies:
```
--ink-light: #8a7565 (shared)
```

## Fix

Change `--ink-light` value in the dark mode section of `styles.css:81` from `#a89888` to `#8a7565`.

## Accept When

- `--ink-light` in `[data-theme="dark"]` section of styles.css is `#8a7565`
- Dark mode labels/metadata/timestamps have correct contrast
