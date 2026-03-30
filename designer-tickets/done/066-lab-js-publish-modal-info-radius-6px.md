# DES-066: lab.html Formula Store publish modal info box uses radius:6px

**Priority**: P2
**Area**: frontend/lab.html line 3933
**Cycle**: 6

## Problem

The Formula Store publish modal has an info/helper text box with `border-radius: 6px`, below the `--radius-sm` (8px) minimum:

```html
<div style="font-family:var(--font-hand); font-size:15px; color:var(--ink-light);
  margin-bottom:12px; padding:8px; background:var(--bg); border-radius:6px;
  border:2px dashed var(--ink-faint);">
```

This inline style appears in the publish modal that formula creators see when sharing formulas to the store. While it's not a high-traffic element, it's inconsistent with the rest of the modal which uses proper `var(--radius-sm)`.

## Fix

Change `border-radius:6px` to `border-radius:var(--radius-sm)` (8px).

Better yet, move this inline style to a CSS class in the `<style>` block of lab.html where the other formula store styles live.

## Design Rule

DESIGN.md: `--radius-sm: 8px` is the minimum border-radius for any component.
