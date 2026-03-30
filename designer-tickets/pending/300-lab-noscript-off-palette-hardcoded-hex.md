# DES-300: Lab noscript block uses off-palette hardcoded hex colors

**Priority**: P3
**Category**: Design System
**Page**: lab.html
**Lines**: 3155-3158

## Problem

The `<noscript>` fallback block has inline styles with hardcoded hex colors that are NOT in the design system palette:

- `#6b5a4e` — not `--ink-medium` (`#5c4a3d`) or `--ink-light` (`#8a7565`). Falls between them.
- `#a89585` — not `--ink-faint` (`#c4b5a5`) or `--ink-light` (`#8a7565`). Falls between them.

These off-palette colors are visible to users with JS disabled (ad blockers, corporate firewalls, slow connections).

## Current

```html
<div style="text-align:center; padding:48px 24px; font-family:'Space Mono',monospace; color:#6b5a4e;">
    <p style="font-family:'Luckiest Guy',cursive; font-size:24px; margin-bottom:12px;">JavaScript required</p>
    <p>The Lab needs JavaScript to run. Please enable it or check your ad blocker.</p>
    <p style="font-family:'Caveat',cursive; font-size:18px; margin-top:16px; color:#a89585;">pulling film requires electricity...</p>
</div>
```

## Expected

Use CSS vars (noscript does render CSS):
- `color:#6b5a4e` -> `color:var(--ink-medium, #5c4a3d)`
- `color:#a89585` -> `color:var(--ink-light, #8a7565)`

## Fix

Replace 2 hex values with CSS var() + design system fallback. Also use `var(--font-mono)`, `var(--font-display)`, `var(--font-hand)` instead of hardcoded font names.
