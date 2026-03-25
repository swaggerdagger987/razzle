<!-- PM: ready -->
---
id: DQ-358a
parent: 358 (Orange Hover Hardcoded RGBA Sitewide)
priority: P2
area: frontend/styles.css
section: CSS custom properties
type: color token
status: open
---

# Define --orange-hover CSS variable in :root and dark mode

**File**: `frontend/styles.css`

## What to do

Add a new CSS custom property for the orange hover background used sitewide:

```css
/* In :root */
--orange-hover: rgba(217,119,87,0.08);

/* In [data-theme="dark"] */
--orange-hover: rgba(217,119,87,0.12);
```

This variable will be consumed by DQ-358b, DQ-358c, and DQ-358d.

## Accept when

- `--orange-hover` exists in `:root` with value `rgba(217,119,87,0.08)`
- `--orange-hover` exists in `[data-theme="dark"]` with value `rgba(217,119,87,0.12)`
- No existing styles broken
