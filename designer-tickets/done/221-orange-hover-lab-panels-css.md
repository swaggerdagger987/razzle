<!-- PM: ready -->
---
id: DQ-358b
parent: 358 (Orange Hover Hardcoded RGBA Sitewide)
priority: P2
area: frontend/lab-panels.css
section: table hover states
type: color token
status: open
depends_on: DQ-358a
---

# Replace 30+ hardcoded rgba(217,119,87,0.08) in lab-panels.css with var(--orange-hover)

**File**: `frontend/lab-panels.css`

## What to do

Find-and-replace all instances of `rgba(217,119,87,0.08)` with `var(--orange-hover)` in lab-panels.css. There are 30+ instances at lines: 403, 759, 785, 1467, 1694, 1912, 1947, 1986, 2023, 2061, 2100, 2217, 2351, 2403, 2474, 2529, 2583, 2622, 2690, 2710, 2770, 2798, 2825, 2884, 2938, 2942, 2967, 2991, 3061, 3125, 3131.

## Accept when

- `grep -c "rgba(217,119,87,0.08)" frontend/lab-panels.css` returns 0
- All hover states still visually work (spot-check 3 panels)
- Dark mode hover tint is visible on dark backgrounds

## Depends on

DQ-358a (CSS variable must exist first)
