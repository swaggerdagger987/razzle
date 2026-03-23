# DES-146: Dark mode doesn't auto-detect OS preference (prefers-color-scheme)

**Priority:** P2 — UX / Power User Experience
**Component:** app.js, styles.css
**Affects:** First-visit experience for users with OS dark mode enabled

## Problem

The dark mode toggle exists and works correctly (stored in localStorage). But it does NOT detect the user's OS/browser preference via `prefers-color-scheme`. Zero instances of `prefers-color-scheme` exist anywhere in the codebase (JS or CSS).

This means:
- A user with their phone set to dark mode visits razzle.lol → sees light mode
- They have to manually find and click the theme toggle
- If they don't notice the toggle, they browse in light mode despite preferring dark
- Every competing tool (Sleeper, KeepTradeCut) respects OS preference

Dynasty power users (the primary target) disproportionately use dark mode — they're tech-savvy, spend hours staring at screens, and have strong display preferences.

## Evidence

- Zero matches for `prefers-color-scheme` in any frontend JS or CSS file
- Zero matches for `matchMedia.*dark` in app.js
- The theme toggle logic stores preference in localStorage but doesn't read OS preference as a default
- `docs/DESIGN.md:172` — "Persist preference in localStorage" (correct, but doesn't mention OS detection)

## Fix

In `app.js`, during theme initialization (wherever the localStorage theme is read), add OS preference detection as the default when no localStorage value exists:

```javascript
function initTheme() {
  const stored = localStorage.getItem('razzle_theme');
  if (stored) {
    document.documentElement.setAttribute('data-theme', stored);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}
```

Optionally, also listen for OS theme changes during the session:

```javascript
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('razzle_theme')) {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  }
});
```

The key: OS preference is the DEFAULT. Once a user manually toggles, localStorage takes over permanently.

## Why it matters

Respecting OS preference is baseline UX in 2026. Users who prefer dark mode and don't get it immediately will think "this feels unfinished." First impressions matter — especially for Reddit power users who evaluate tools critically.
