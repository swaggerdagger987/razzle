<!-- PM: ready -->
---
id: DQ-436
priority: P3
area: frontend/favicon.svg
section: brand / dark mode
type: visual polish
status: open
cycle: 56
---

# Favicon SVG has no dark mode adaptation — emoji renders identically in light and dark browser chrome

## What's wrong

The favicon (`frontend/favicon.svg`) contains:
```svg
<text y=".9em" font-size="90">🐯</text>
```

This static emoji SVG has no `prefers-color-scheme` media query. In dark browser tabs (Chrome, Firefox, Safari all support this), the favicon renders identically. SVG favicons can adapt to dark mode:

```svg
<svg xmlns="http://www.w3.org/2000/svg">
  <style>
    @media (prefers-color-scheme: dark) {
      /* could add a background circle or adjust rendering */
    }
  </style>
  <text y=".9em" font-size="90">🐯</text>
</svg>
```

## Where

- `frontend/favicon.svg` — single emoji text node, no CSS
- Referenced in all 75 HTML pages via `<link rel="icon">`

## Fix

Add a `prefers-color-scheme: dark` media query inside the SVG that adds a subtle warm-brown background circle behind the emoji, improving visibility against dark browser chrome:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <style>
    circle { fill: transparent; }
    @media (prefers-color-scheme: dark) {
      circle { fill: #4a3728; }
    }
  </style>
  <circle cx="50" cy="50" r="48"/>
  <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="70">🐯</text>
</svg>
```

## Not a duplicate of

- DQ-055: covers system emoji mascot brand issue (broader), not favicon dark mode specifically
- DQ-255: covers favicon path inconsistency, not dark mode
- DQ-056: covers meta theme-color no dark mode, not favicon

## Why this matters

Low severity but high visibility — the favicon is the most persistent brand touchpoint. Users staring at dark browser tabs see every other site's favicon adapt while Razzle's stays flat.
