---
id: DQ-096
title: backdrop-filter missing -webkit- prefix — Safari users see no blur on command palette
priority: P3
category: cross-browser
status: open
cycle: 13
---

## Problem

The command palette modal overlay (Ctrl+K) uses `backdrop-filter: blur(4px)` in styles.css:1073 but has no `-webkit-backdrop-filter` prefix. Safari requires the webkit prefix for backdrop-filter support. Safari users see a flat overlay with no blur effect — the command palette loses its premium glass feel.

## Evidence

Code:
- `grep -n "backdrop-filter" frontend/styles.css` → line 1073: `backdrop-filter: blur(4px);`
- `grep -n "-webkit-backdrop-filter" frontend/` → 0 results

Safari (including all iOS browsers, which use WebKit) accounts for ~25% of web traffic.

## Fix

Add the webkit prefix immediately above the standard property:

```css
.cmd-palette-backdrop {
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}
```

One line, zero risk.

## Files
- `frontend/styles.css:1073` (add -webkit- prefix)
