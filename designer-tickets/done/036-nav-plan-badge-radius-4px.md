# DES-036: Nav plan badge border-radius 4px — below design system minimum

**Priority**: P2
**Area**: sitewide (styles.css)
**Impact**: The navigation plan badges (FREE / PRO / ELITE) that appear in the top nav bar use `border-radius: 4px` — below the design system minimum of `--radius-sm` (8px). These badges are visible on every page and signal the user's tier status.

## The Problem

`frontend/styles.css` line 451:
```css
.nav-plan-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;     /* ← should be var(--radius-sm) = 8px */
  border: 2px solid;
}
```

Also in styles.css line 1145:
```css
.cmd-palette-pos {
  border-radius: 4px;     /* ← same violation */
}
```

And line 1500 (diff-mode-label, covered in DES-033):
```css
.diff-mode-label {
  border-radius: 4px;     /* ← same violation */
}
```

The DESIGN.md border radius token table says `--radius-sm` (8px) is for "inputs, small badges, pricing badges, info boxes." These are all small badges.

## The Fix

```css
.nav-plan-badge {
  border-radius: var(--radius-sm);  /* 8px */
}
.cmd-palette-pos {
  border-radius: var(--radius-sm);  /* 8px */
}
```

## Why This Matters

The nav plan badge is seen on every page by every logged-in user. It's a persistent brand touch. 4px feels corporate and angular. 8px matches the chunky, sticker-like aesthetic that defines Razzle's visual identity. Small details compound into the overall impression.
