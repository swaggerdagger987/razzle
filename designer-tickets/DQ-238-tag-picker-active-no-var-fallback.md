---
id: DQ-238
priority: P2
category: broken colors / Lab
pages: styles.css (affects lab.html)
status: open
cycle: 33
---

# Tag picker active state has no CSS variable fallback — invisible border if --tag-color unset

## What's wrong

In `styles.css` line 1445-1447, `.tag-picker-option.active` uses `var(--tag-color)` without a fallback:

```css
.tag-picker-option.active {
  background: var(--tag-bg);        /* no fallback */
  border: 2px solid var(--tag-color); /* no fallback */
}
```

Meanwhile, the `:hover` state on line 1443 correctly uses a fallback:
```css
.tag-picker-option:hover {
  background: var(--tag-bg, var(--bg-warm)); /* has fallback */
}
```

If `--tag-color` or `--tag-bg` is not set via inline style (e.g., if JS fails to apply it, or a new tag type is added without a color), the active tag option renders with:
- Transparent background (invisible)
- Transparent border (invisible selection indicator)

The user would click a tag option and see no visual feedback that it's selected.

## Fix

Add fallbacks matching the design system:

```css
.tag-picker-option.active {
  background: var(--tag-bg, var(--orange-light));
  border: 2px solid var(--tag-color, var(--orange));
}
```

## Verification

In the Lab, open the tag picker. Click a tag. The active tag should always have a visible background and border, even if custom properties are missing.
