# DES-076: styles.css skeleton-cell border-radius:4px below minimum

**Priority**: P3
**Area**: frontend/styles.css line 821
**Cycle**: 7

## Problem

The loading skeleton cell uses a sub-minimum border radius:

```css
.skeleton-cell {
  height: 16px;
  border-radius: 4px;        /* VIOLATION: below 8px minimum */
  background: var(--bg-warm);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
```

The skeleton loader is the FIRST thing users see when any data loads. On the Screener, the skeleton briefly appears before every query result. The 4px radius on 16px-tall cells is subtly different from every other component on the page (which uses 8px minimum).

An 8px radius on a 16px-tall element creates attractive pill-shaped skeleton bars — consistent with the "chunky, sticker-like" aesthetic. See how breakout badges (20px radius on ~20px elements) look intentionally rounded.

## Fix

```css
.skeleton-cell {
  height: 16px;
  border-radius: var(--radius-sm);
  background: var(--bg-warm);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
```

## Design Rule

DESIGN.md: `--radius-sm: 8px` is the minimum border-radius for any component.
