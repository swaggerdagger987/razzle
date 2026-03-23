# DES-106: Nav search hint (.nav-search-hint) touch target below 24px minimum

**Priority**: P2
**Area**: frontend/styles.css (~line 438)
**Cycle**: 10

## Problem

The Ctrl+K search hint in the navigation bar is a clickable element that opens the command palette. Its current dimensions:

```css
.nav-search-hint {
  font-size: 11px;
  padding: 3px 8px;
  border: 2px solid var(--ink-light);
  /* Total height: ~19px (3+3 padding + 11px font + 2+2 border) */
}
```

At ~19px tall, it fails the WCAG 2.5.8 minimum of 24×24px. This element appears on **every page** and is the primary entry point to global search — the command palette that lets users search players across the entire platform.

On mobile, the nav-plan-badge has the same issue:

```css
.nav-plan-badge {
  font-size: 10px;
  padding: 2px 6px;
  border: 2px solid;
  /* Total height: ~18px */
}
```

## Fix

Increase padding on both elements to meet the 24px minimum:

```css
.nav-search-hint {
  padding: 5px 10px; /* bumps to ~25px height */
}

.nav-plan-badge {
  padding: 4px 8px; /* bumps to ~24px height */
}
```

Or add min-height:

```css
.nav-search-hint {
  min-height: 24px;
  display: inline-flex;
  align-items: center;
}
```

The visual change is subtle — 2-3px more padding — but the touch hit area becomes reliable on mobile.

## Why This Matters

The nav search hint is on every page. It's the fastest way to find a player. Mobile users from Reddit/Twitter who can't tap it miss the command palette entirely — and the command palette is one of the best "this tool is serious" signals for power users.
