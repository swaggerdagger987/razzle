# DES-018: Nav active link and plan badges invisible in dark mode

**Priority**: P1
**Area**: sitewide (styles.css)
**Impact**: Active nav link, Pro badge, and Elite badge all use hardcoded `color: white` with no dark mode override. Navigation becomes confusing — user can't tell which page they're on.

## The Problem

`frontend/styles.css`:
- Line 223: `.nav-links a.active { color: white; }` — active nav state
- Line 457: `.nav-plan-pro { color: white; }` — Pro tier badge in nav
- Line 475: `.nav-plan-elite { color: white; }` — Elite tier badge in nav

None have `[data-theme="dark"]` overrides.

## The Fix

```css
[data-theme="dark"] .nav-links a.active {
  color: var(--bg);  /* espresso text on dark mode active state */
}
[data-theme="dark"] .nav-plan-pro,
[data-theme="dark"] .nav-plan-elite {
  color: var(--bg);
}
```

## Why This Matters

Nav is visible on every page. If a user toggles dark mode and can't see which page is active, it's a broken navigation experience. Plan badges (Pro/Elite) should also be clearly visible — they're social proof.
