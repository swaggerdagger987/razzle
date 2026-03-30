---
id: DQ-150
priority: P3
area: typography
section: text-wrap
type: design-polish
status: open
---

# No text-wrap: balance on headings — uneven line breaks on mobile

## What's wrong

`text-wrap: balance` distributes text more evenly across lines, preventing the common pattern where a heading wraps with one long line and one orphan word. Zero instances exist anywhere in the frontend. On mobile, multi-line headings break unevenly — e.g., "Positional Advantage" fits one line but "Buy Low / Sell High Dashboard" breaks as "Buy Low / Sell High" + "Dashboard" (orphan).

## Where

- 0 instances of `text-wrap: balance` in any CSS or HTML file
- 75 pages with h1 headings, many wrapping on mobile viewports (375px)
- Particularly visible on long page titles: "Strength of Schedule", "Dynasty Trade Value Chart", "Opportunity Share & Dominator Rating"

## Fix

Add to the h1 baseline in styles.css (pairs with DQ-143):

```css
h1 {
  text-wrap: balance;
}
```

Progressive enhancement: browsers that don't support it ignore it. Chrome, Firefox, and Safari all support it since 2023.

## Why this matters

Orphan words on headings look sloppy. "text-wrap: balance" is a zero-risk progressive enhancement that makes every heading look intentionally typeset rather than randomly reflowed. On the comic-strip aesthetic, clean typography matters.
