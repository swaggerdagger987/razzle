---
id: DQ-180
priority: P2
category: dark-mode/css
status: open
cycle: 26
---

# Lab "Reset All" filter tag styled entirely via inline JS — dark mode broken

## What's wrong

The "Reset All" filter tag in the Lab screener is styled with inline JavaScript instead of a CSS class. The inline style hardcodes `background:var(--ink); color:var(--bg)` which works in light mode (dark text on sand inverted to sand text on dark). However:
- Inline styles can't be overridden by CSS cascade or media queries
- No hover/focus states defined
- The `font-weight:700` and `cursor:pointer` should be in CSS, not inline
- If dark mode variable mapping ever changes, this inline code won't update

## Where

- `frontend/lab.js:3284`

## Code

```javascript
html += `<span class="filter-tag" style="background:var(--ink); color:var(--bg); cursor:pointer; font-weight:700;"
  onclick="clearAllFilters()" title="Clear all filters">Reset All x</span>`;
```

## Fix

Add a `.filter-tag-reset` class in styles.css (or lab.html `<style>`):

```css
.filter-tag-reset {
  background: var(--ink);
  color: var(--bg);
  cursor: pointer;
  font-weight: 700;
}
.filter-tag-reset:hover {
  background: var(--red);
  color: var(--bg-card);
}
```

Replace inline style with `class="filter-tag filter-tag-reset"`.

## Test

1. Open Lab, add 2+ filters. "Reset All" tag should appear with dark background.
2. Toggle dark mode. Background should invert correctly (sand bg, espresso text).
3. Hover "Reset All". Should show red hover state.
