# DES-180: Chips/badges min-height 24px — below 44px WCAG touch target on mobile

**Priority**: P1 — Mobile UX (conversion-critical)
**Scope**: styles.css, lab-panels.css, lab.html
**Category**: Accessibility / Mobile UX

## Problem

Multiple interactive elements have `min-height: 24px` — well below the 44px WCAG SC 2.5.8 minimum touch target size:

| Selector | File | Line | min-height |
|----------|------|------|-----------|
| `.nav-search-hint` | styles.css | 448 | 24px |
| `.pos-badge` (or similar) | styles.css | 496 | 24px |
| `.ccp-chip-rm` (comp remove) | lab-panels.css | 2954 | 24px |
| `.rbld-remove-btn` (roster remove) | lab-panels.css | 3519 | 24px |
| column picker items | lab.html | 794 | 24px |
| filter chips | lab.html | 854 | 24px |

These are CORE screener interactions — position filter chips, remove buttons, filter chips, search hint. On mobile (62% of traffic from Twitter/Reddit), users will mis-tap constantly. Fat-finger taps miss the target and hit adjacent elements.

The auth modal close button (`.auth-modal-close`) correctly uses `min-height: 44px` — the pattern exists.

## Fix

Add mobile touch-target override in the existing `@media (max-width: 768px)` block:

```css
@media (max-width: 768px) {
  .nav-search-hint,
  .chip,
  .pos-badge,
  .ccp-chip-rm,
  .rbld-remove-btn {
    min-height: 44px;
    min-width: 44px;
  }
}
```

For elements where visual size must stay small, use padding or `::before`/`::after` pseudo-elements to extend the touch target without changing visible size.

## Why this matters

Mobile users from Twitter/Reddit are the primary funnel entry. A tappable filter chip that's too small to tap = frustrated first impression. The Screener is the growth engine — every mis-tap is a potential bounce.
