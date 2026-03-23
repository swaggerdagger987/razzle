---
id: DQ-143
priority: P2
area: typography
section: headings
type: design-system-gap
status: open
---

# No h1/h2 baseline sizing in styles.css — each page defines its own

## What's wrong

styles.css has zero rules for `h1` or `h2` elements. Each of the 75 standalone HTML pages defines heading sizes in its own `<style>` block, resulting in visual drift: some pages use 32px, some 28px, some 26px, some 20px for h1. DESIGN.md specifies 32px/700 for page titles and 20px/700 for card headers.

## Where

- `styles.css` — NO `h1 { }` or `h2 { }` rule exists
- 70+ standalone pages each define their own `.xx-header h1 { font-size: 32px; }` pattern
- Some pages use 28px (home, about), some 26px (mobile breakpoints), some 20px (card contexts)

## Fix

Add baseline heading rules to styles.css:

```css
h1 {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--ink);
  margin: 0 0 4px 0;
}

h2 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--ink);
  margin: 0 0 8px 0;
}
```

Then remove the redundant per-page heading font-size/font-family/font-weight declarations that match these baselines. Per-page overrides for genuinely different contexts (e.g., card headers at 16px) remain.

## Why this matters

When 75 pages each pick their own heading size, the site looks like it was built by different teams. A baseline ensures visual consistency without preventing intentional per-page overrides.
