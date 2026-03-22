# DES-026: Home page inline styles bypass dark mode system

**Priority**: P2
**Area**: index.html
**Impact**: Home page has inline `<style>` blocks with hardcoded colors that don't respond to the dark mode toggle. Sections styled with inline `background: #1a110a` and `color: #c4b5a5` look correct in light mode but won't flip properly when dark mode is toggled — the dark section stays dark regardless.

## The Problem

`frontend/index.html` lines ~273, ~280:
```html
<style>
  .some-section { background: #1a110a; }  /* hardcoded --bg-ink */
  .some-text { color: #c4b5a5; }          /* hardcoded --ink-medium dark mode value */
</style>
```

These use hardcoded hex values instead of CSS variables. When `[data-theme="dark"]` is toggled, these sections don't respond. The Situation Room preview section may look correct because it's intentionally dark, but any other section using these inline styles breaks the espresso flip pattern.

Additionally, sidebar category labels use inline styles:
- Line 3157: `style="color:var(--orange)"` (OK — uses variable)
- Line 3161: `style="color:var(--ink-light)"` (OK — uses variable)
- Line 3173: `style="color:var(--orange)"` (OK)

The lab.html inline styles correctly use CSS variables, but index.html does not.

## The Fix

Replace hardcoded hex values with CSS variables:
```css
background: var(--bg-ink);     /* instead of #1a110a */
color: var(--ink-medium);      /* instead of #c4b5a5 */
```

Or move inline styles to styles.css with proper `[data-theme="dark"]` overrides.

## Why This Matters

Dark mode users expect the entire page to flip. Sections that stay static while the rest changes feel jarring and broken. Home page is the first impression — it must be flawless in both modes.
