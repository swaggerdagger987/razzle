---
id: DQ-172
priority: P0
category: css/broken
status: open
cycle: 26
---

# GP filter tag uses non-existent --bg-sand CSS variable

## What's wrong

The GP (games played) minimum filter tag in the screener uses `var(--bg-sand)` as its background color. This CSS variable does NOT exist in `:root` or anywhere in styles.css. The defined background variables are `--bg`, `--bg-warm`, `--bg-card`, and `--bg-ink`.

When a CSS variable is undefined, the property falls back to `initial` (transparent), making the GP filter tag invisible or missing its background — a broken visual on the most-used feature.

## Where

- `frontend/lab.js:3271`

## Code

```javascript
html += `<span class="filter-tag" style="background:var(--bg-sand);">GP >= ${state.minGP} <span ...>x</span></span> `;
```

## Fix

Replace `var(--bg-sand)` with `var(--yellow-light)` to match the other `.filter-tag` elements (which get their background from the CSS class at lab.html:781).

Or better: remove the inline `style="background:var(--bg-sand);"` entirely and let the `.filter-tag` class provide the background.

## Test

1. Open Lab, set GP minimum to 10. The GP filter tag should have a visible yellow-light background matching other filter chips.
