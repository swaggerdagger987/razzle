# DES-020: Active position chips unreadable in dark mode

**Priority**: P1
**Area**: sitewide (styles.css)
**Impact**: Position filter chips (QB/RB/WR/TE) in active state use hardcoded `color: white`. These are on the Screener toolbar — the most-used feature on the entire site. If position filtering looks broken in dark mode, the growth engine is degraded.

## The Problem

`frontend/styles.css` line 778:
```css
.chip.active {
  color: white;  /* hardcoded, no dark mode override */
}
```

Also affects:
- Line 1108: `.cmd-palette-item .player-headshot-fallback { color: #fff; }` — Command palette initials
- Line 1142: `.cmd-palette-pos { color: #fff; }` — Command palette position badges

None have dark mode overrides.

## The Fix

```css
[data-theme="dark"] .chip.active {
  color: var(--bg);
}
[data-theme="dark"] .cmd-palette-item .player-headshot-fallback,
[data-theme="dark"] .cmd-palette-pos {
  color: var(--bg);
}
```

## Why This Matters

Position chips are the first thing a user clicks in the Screener. Command palette (Ctrl+K) is the power user shortcut. Both need to work in dark mode. Power users are exactly the people who toggle dark mode.
