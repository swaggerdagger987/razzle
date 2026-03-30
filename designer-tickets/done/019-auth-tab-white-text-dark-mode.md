# DES-019: Auth modal active tab invisible in dark mode

**Priority**: P1
**Area**: sitewide (styles.css)
**Impact**: Login/Register modal — the active tab (Login vs Register) uses `color: white` with no dark mode override. User can't tell which form they're looking at. This is on the conversion path.

## The Problem

`frontend/styles.css` line 655:
```css
.auth-tab.active {
  color: white;  /* hardcoded, no dark mode override */
}
```

## The Fix

```css
[data-theme="dark"] .auth-tab.active {
  color: var(--bg);
}
```

## Why This Matters

Auth modal is the gate between "browsing" and "registered user." If the active tab is unreadable in dark mode, users might submit the wrong form or feel the product is unpolished. Direct conversion impact.
