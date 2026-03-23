---
id: DQ-136
priority: P2
area: design-system
section: prompts-page
type: token-violation
status: open
---

# Prompts page .use-btn hover shadow is only 2px

## What's wrong

On prompts.html, the "Use in Situation Room" button has a hover state with `box-shadow: 2px 2px 0 var(--ink)` (line 87). DESIGN.md says hover lift should be `6px 6px 0 var(--ink)` + `translate(-2px, -2px)`.

The button sits next to `.copy-btn` which has NO hover shadow at all (just color change). Both are undersized for the Razzle aesthetic.

## Where

- `frontend/prompts.html` line 87

## Fix

```css
.use-btn:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

Also add shadow + lift to `.copy-btn:hover`:
```css
.copy-btn:hover {
  background: var(--orange); color: var(--bg); border-color: var(--orange);
  box-shadow: 4px 4px 0 var(--ink);
  transform: translate(-1px, -1px);
}
```

## Why this matters

Buttons that don't lift on hover feel dead. The prompts page is a key conversion path — users copying prompts should feel the chunky interaction feedback.
