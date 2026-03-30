# DQ-020: Dashboard row hover uses hardcoded rgba without dark mode override

**Priority**: P2 — affects dashboard readability in dark mode
**Category**: Dark mode

## Problem

`frontend/dashboard.html` line 145 uses a hardcoded terracotta hover effect with no dark mode override:

```css
.db-row:hover { background: rgba(217,119,87,0.05); }
```

This file has zero `[data-theme="dark"]` overrides in its entire style block. While the 5% terracotta tint might be subtle enough to work on dark backgrounds, the lack of any dark mode consideration means if the tint needs adjustment, there's no mechanism for it.

Additionally, `frontend/tiers.html` line 139 uses:
```css
text-shadow: 2px 2px 0 rgba(45,31,20,0.2);
```
This espresso text-shadow is invisible against the espresso dark mode background — the shadow color matches the page background.

## Fix

**dashboard.html**: Add dark mode override if the hover tint is invisible or wrong:
```css
[data-theme="dark"] .db-row:hover { background: rgba(217,119,87,0.08); }
```

**tiers.html** line 139: Add dark mode override for text-shadow:
```css
[data-theme="dark"] .tl-tier-letter {
  text-shadow: 2px 2px 0 rgba(237,224,207,0.2);
}
```

## Verification

Toggle dark mode on dashboard and tier list pages. Hover effects and text shadows should be visible in both themes.
