# DES-322: Unused @keyframes nudgeFadeIn in styles.css — dead code

**Priority**: P3
**Area**: styles.css (lines 1624-1629)
**Cycle**: 30

## Problem

`@keyframes nudgeFadeIn` is defined at styles.css line 1631 but never referenced by any `animation:` declaration in the entire frontend codebase.

```css
@keyframes nudgeFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

All other @keyframes in the codebase ARE used:
- `trial-pulse` (line 520) → used by `.nav-plan-trial`
- `skeleton-pulse` (line 884) → used by `.skeleton-cell`
- `loadingDots` (line 1624) → used by `.loading-text::after`
- `md-pulse` (lab-panels.css 3943) → used by `.md-pin-indicator`
- `md-pulse-border` (lab-panels.css 4020) → used by `.md-current-pick`

`nudgeFadeIn` is the only orphan.

## Fix

Delete the `@keyframes nudgeFadeIn` block (4 lines).

## Why This Matters

Dead code in a stylesheet that loads on every page. Small, but it signals incomplete cleanup — likely a leftover from a removed feature.
