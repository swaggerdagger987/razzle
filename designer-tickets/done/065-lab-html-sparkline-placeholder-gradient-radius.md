# DES-065: lab.html sparkline-placeholder uses repeating-linear-gradient + radius:3px

**Priority**: P2
**Area**: frontend/lab.html lines 1494-1497
**Cycle**: 6

## Problem

The sparkline placeholder loading state has two design violations in one element:

```css
.sparkline-placeholder {
  display: inline-block;
  width: 72px;
  height: 22px;
  background: repeating-linear-gradient(90deg, var(--ink-faint) 0px, var(--ink-faint) 4px, transparent 4px, transparent 8px);
  opacity: 0.3;
  border-radius: 3px;   /* VIOLATION: below 8px minimum */
}
```

1. **Gradient**: `repeating-linear-gradient` creates a striped loading pattern. Design guide bans gradients.
2. **Radius**: `3px` is below the `--radius-sm` (8px) minimum.

## Fix

```css
.sparkline-placeholder {
  display: inline-block;
  width: 72px;
  height: 22px;
  background: var(--ink-faint);
  opacity: 0.3;
  border-radius: var(--radius-sm);
}
```

Replace the striped gradient with a solid `--ink-faint` block. The opacity already communicates "loading placeholder" without needing stripes. This is consistent with other loading states in the app which use solid colors + personality text ("pulling film...").

## Design Rule

DESIGN.md: "Don't: Gradients." Also: `--radius-sm: 8px` minimum.
