# DES-033: Diff-mode label uses hardcoded white text and 4px radius

**Priority**: P2
**Area**: styles.css
**Impact**: The diff-mode label (compare mode indicator in the Lab) has two violations: hardcoded `color: white` with no dark mode override, and `border-radius: 4px` below the design system minimum.

## The Problem

`frontend/styles.css` lines 1495-1501:
```css
.diff-mode-label {
  background: var(--green);
  color: white;           /* ← hardcoded, no dark mode override */
  font-weight: 700;
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 4px;     /* ← should be var(--radius-sm) = 8px */
  letter-spacing: 0.5px;
}
```

## The Fix

```css
.diff-mode-label {
  background: var(--green);
  color: var(--bg);            /* white in light, sand in dark */
  font-weight: 700;
  font-size: 10px;
  padding: 1px 8px;
  border-radius: var(--radius-sm);  /* 8px */
  letter-spacing: 0.5px;
}
```

## Why This Matters

The diff-mode label appears when users compare players in the Lab — an engaged power-user behavior. The label should match the badge aesthetic and work correctly in dark mode.
