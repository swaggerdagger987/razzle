---
id: DQ-226
title: Command palette backdrop has no solid background fallback — transparent on unsupported browsers
priority: P2
category: cross-browser
status: open
cycle: 32
---

## Problem

The command palette overlay (Ctrl+K) uses `backdrop-filter: blur(4px)` but relies entirely on this for visual separation. On browsers that don't support `backdrop-filter` (or when `-webkit-` prefix is missing per DQ-096), the overlay has only `background: rgba(45,31,20,0.5)` — which may be too transparent to properly obscure the page behind it.

This is DIFFERENT from DQ-096 (webkit prefix). Even with the prefix fix, older browsers need a stronger solid background as fallback. The current 50% opacity background lets too much page content bleed through when blur doesn't work.

## Evidence

- `frontend/styles.css:1073` — `.cmd-palette-backdrop { backdrop-filter: blur(4px); }`
- Background color at ~50% opacity is insufficient without blur to create proper modal focus

## Fix

Increase the background opacity for the no-blur fallback:
```css
.cmd-palette-backdrop {
  background: rgba(45, 31, 20, 0.75); /* stronger fallback */
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}

@supports (backdrop-filter: blur(4px)) {
  .cmd-palette-backdrop {
    background: rgba(45, 31, 20, 0.5); /* lighter when blur works */
  }
}
```

## Files
- `frontend/styles.css:1073`
