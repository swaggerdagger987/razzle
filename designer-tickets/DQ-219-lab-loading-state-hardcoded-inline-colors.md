# DQ-219: Lab loading/error fallback uses hardcoded inline colors

**Priority**: P2
**Category**: Dark mode / Design tokens
**Page**: lab.html

## What's wrong

The Lab's offline/error fallback section uses hardcoded hex colors in inline styles instead of CSS variables. These will render incorrectly in dark mode — dark brown text on dark brown background = invisible.

## Where

- `lab.html:3155` — `color:#6b5a4e` (hardcoded medium brown, should be `var(--ink-medium)`)
- `lab.html:3158` — `color:#a89585` (hardcoded light brown, should be `var(--ink-light)`)

```html
<div style="text-align:center; padding:48px 24px; font-family:'Space Mono',monospace; color:#6b5a4e;">
  ...
  <p style="font-family:'Caveat',cursive; font-size:18px; margin-top:16px; color:#a89585;">pulling film requires electricity...</p>
</div>
```

## Fix

Replace hardcoded hex with CSS variables:
- `color:#6b5a4e` → `color:var(--ink-medium)`
- `color:#a89585` → `color:var(--ink-light)`

## Not a dupe of

- DQ-005 (noscript hardcoded colors) — that's specifically about the `<noscript>` block, not the loading/error fallback
- DQ-058 (standalone hardcoded rgba) — that's about standalone panel pages
