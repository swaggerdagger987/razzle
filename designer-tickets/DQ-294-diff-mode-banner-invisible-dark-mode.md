---
id: DQ-294
title: diff-mode-banner background vanishes in dark mode — compare mode invisible
priority: P2
category: dark mode / UX
page: lab.html (via styles.css)
status: open
cycle: 39
---

## What's wrong

The diff-mode-banner (styles.css:1574-1586) uses `background: var(--green-light)` which becomes `#1a3a36` in dark mode. The page background `--bg` is `#2d1f14`.

`#1a3a36` on `#2d1f14` has almost no visual contrast — the banner that tells users "you're in compare mode" becomes essentially invisible. Users won't notice they're comparing players, and may be confused by the different data display.

## Evidence

- styles.css:1575: `background: var(--green-light);`
- Dark mode: `--green-light` = `#1a3a36` (very dark muted green)
- Dark mode: `--bg` = `#2d1f14` (espresso)
- No `[data-theme="dark"]` override exists for `.diff-mode-banner`

## Fix

Add a dark mode override with a more visible green:

```css
[data-theme="dark"] .diff-mode-banner {
  background: rgba(46, 196, 182, 0.15);  /* --green at 15% opacity */
  border-color: var(--green);
}
```

This gives a subtle green tint that's clearly visible against the dark background while keeping the muted aesthetic.

## Not a dupe of

- done/033 fixed `.diff-mode-LABEL` (child element) white text + radius — this is the BANNER (parent element)

## Files
- `frontend/styles.css` line 1574-1586
