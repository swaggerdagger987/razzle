---
id: DQ-149
priority: P3
area: dark-mode
section: browser-chrome
type: design-system-gap
status: open
---

# No color-scheme declaration — browser chrome ignores dark mode

## What's wrong

Razzle has dark mode via `data-theme="dark"` and app.js detects `prefers-color-scheme: dark`. But there is no `<meta name="color-scheme" content="light dark">` in any HTML file, and no `color-scheme: light dark` CSS property on `:root`. Without this, browser-native UI (scrollbars, form controls, autofill backgrounds, text selection) stays in light mode even when dark mode is active.

## Where

- 0 `<meta name="color-scheme"` tags in 75 HTML files
- 0 `color-scheme:` CSS property instances
- `app.js:35,43` — detects `prefers-color-scheme` but doesn't set `color-scheme`

## Fix

**Option A (recommended):** Add dynamic color-scheme via app.js when toggling themes:

```js
// In the theme toggle function:
document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
```

**Option B:** Add CSS:
```css
:root { color-scheme: light; }
[data-theme="dark"] { color-scheme: dark; }
```

## Why this matters

In dark mode, scrollbars are bright white tracks on the espresso background. Form inputs (autofill, date pickers) render with white backgrounds. Text selection uses the default blue instead of the warm orange. The dark mode feels 90% done because the browser chrome doesn't participate.
