# DQ-342: Pricing trial banner hardcoded hex fallback defeats dark mode

**Priority**: P2
**Category**: Dark Mode — Pricing
**File**: frontend/pricing.html, lines 216 and 223

## Problem

Trial banner uses CSS var with hardcoded hex fallback:
```css
background: var(--orange-light, #f7e4d8);
```

The hex fallback `#f7e4d8` is the LIGHT MODE value of `--orange-light`. In dark mode, `--orange-light` resolves to `#5c3325` (per DESIGN.md Espresso Flip). But if the CSS var fails for any reason, the fallback is always the light-mode hex — creating a bright light-mode colored banner in dark mode.

CSS var fallbacks should use other CSS vars, not hardcoded hex.

## Fix

Remove the hex fallback — CSS vars are universally supported:
```css
background: var(--orange-light);
```

Or if a fallback is truly needed, use the dark-mode-safe approach:
```css
background: var(--orange-light, var(--bg-warm));
```
