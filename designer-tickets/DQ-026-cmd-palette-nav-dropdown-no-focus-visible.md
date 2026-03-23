# DQ-026: cmd-palette-item and nav-dropdown-item missing :focus-visible

**Priority**: P2 — Keyboard navigation gap
**Category**: Accessibility / Interactive States
**Severity**: HIGH — Users tabbing through these elements get no visual feedback

## Problem

Two frequently-used interactive elements have cursor:pointer and :hover states but NO :focus-visible outline:

### 1. `.cmd-palette-item` (styles.css ~line 1146)
The global search (Ctrl+K) dropdown items have hover but no keyboard focus ring.

### 2. `.nav-dropdown-item` (styles.css ~line 594)
Navigation dropdown items (The Lab, Bureau, etc.) have hover but no keyboard focus ring.

## Fix

Add to `styles.css`:

```css
.cmd-palette-item:focus-visible {
  outline: 2px solid var(--orange);
  outline-offset: 2px;
}

.nav-dropdown-item:focus-visible {
  outline: 2px solid var(--orange);
  outline-offset: 2px;
}
```

## Test

Tab through the Ctrl+K command palette and nav dropdowns — each item should show an orange focus ring.
