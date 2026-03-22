# DES-025: Home page footer grid columns too wide for 375px phones

**Priority**: P2
**Area**: index.html
**Impact**: Footer grid uses `minmax(140px, 1fr)` for columns. On 375px phones with 24px padding on each side, usable width is 327px. With 140px minimum and 16px gap, only 2 columns fit, leaving wasted space and an awkward layout. Footer links may get cut or wrapped poorly.

## The Problem

`frontend/index.html` line 838 (approximate):
```html
<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));
            gap:24px 16px; max-width:900px; margin:0 auto 24px; padding:0 24px;">
```

140px minimum column width is too large for small phones. The footer has 6 columns of links — at 375px, they can only show 2 per row, creating 3 rows of links that don't fit the visual rhythm.

## The Fix

Reduce minimum width in the grid:
```html
grid-template-columns: repeat(auto-fit, minmax(110px, 1fr))
```

Or add a 375px media query override:
```css
@media (max-width: 375px) {
  .footer-grid {
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 12px 8px;
  }
}
```

## Why This Matters

Footer is the last thing users see before bouncing or converting. A messy footer signals "this site wasn't finished." iPhone SE/Mini users (375px) are a real segment of the target audience.
