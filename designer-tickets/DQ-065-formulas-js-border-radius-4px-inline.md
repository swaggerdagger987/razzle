# DQ-065: formulas.js `border-radius: 4px` in inline cssText

**Priority**: P3 — Small visual, affects formula builder badges
**Category**: Border Radius Token
**Severity**: LOW — sub-minimum radius on formula type badges

## Problem

DESIGN.md border radius tokens:
- `--radius-sm`: 8px (minimum for inputs, small badges)
- `--radius`: 12px (cards, containers)
- `--radius-lg`: 20px (pills, chips)

`formulas.js` line 273 uses `border-radius: 4px` in an inline `style.cssText` for formula type badges:

```javascript
badge.style.cssText = "font-family:var(--font-mono); font-size:9px; margin-bottom:6px; display:inline-block; padding:2px 8px; border-radius:4px;";
```

Same pattern appears in `lab.js` line ~4522:
```javascript
badge.style.cssText = "font-family:var(--font-mono); font-size:9px; margin-bottom:6px; display:inline-block; padding:2px 8px; border-radius:var(--radius-sm);";
```

lab.js already uses the correct `var(--radius-sm)`. formulas.js has the old hardcoded value.

## Fix

In `formulas.js` line 273, change `border-radius:4px` to `border-radius:var(--radius-sm)`:

```javascript
badge.style.cssText = "...; border-radius:var(--radius-sm);";
```

## Verification

Open the formula builder modal in the Lab. Type badges should have 8px rounded corners matching the rest of the UI.
