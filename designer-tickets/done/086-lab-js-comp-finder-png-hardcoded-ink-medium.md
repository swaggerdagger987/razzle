# DES-086: Comp-finder PNG export uses hardcoded light-mode ink-medium

**Priority**: P2
**Area**: frontend/lab.js lines 12415, 12419
**Cycle**: 8

## Problem

The comp-finder PNG export canvas renderer uses hardcoded hex for similarity score text:

```javascript
const simColor = c.similarity >= 95 ? "#2ec4b6" : c.similarity >= 90 ? "#d97757" : "#5c4a3d";
ctx.fillStyle = simColor;
```

`#5c4a3d` is the hardcoded `--ink-medium` light-mode value. In dark mode, this renders as dark brown text on an espresso background — poor contrast.

The accent colors (`#2ec4b6`, `#d97757`) are the same in both modes, so they're fine. But the fallback `#5c4a3d` needs to flip to `#c4b5a5` (the dark mode `--ink-medium` value).

## Fix

Use `getCanvasTheme()` (after DES-069 adds accent properties) or read from CSS:

```javascript
const t = getCanvasTheme();
const simColor = c.similarity >= 95 ? t.green || "#2ec4b6"
               : c.similarity >= 90 ? t.orange || "#d97757"
               : t.inkMedium || "#5c4a3d";
```

Or read directly:
```javascript
const inkMedium = getComputedStyle(document.documentElement).getPropertyValue('--ink-medium').trim();
```

## Design Rule

DESIGN.md: `--ink-medium` flips from `#5c4a3d` (light) to `#c4b5a5` (dark). Canvas code must respect the active theme.
