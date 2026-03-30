---
id: DQ-133
priority: P2
area: design-consistency
section: prompts-page
type: visual-inconsistency
status: open
---

# Prompts page .prompt-agent badge has no border (inconsistent with .prompt-cat)

## What's wrong

On prompts.html, each prompt card shows two badge types side-by-side:
- `.prompt-cat` (line 56): has `border: 2px solid var(--ink)` — chunky, on-brand
- `.prompt-agent` (line 61): has NO border — flat colored pill, off-brand

DESIGN.md says chips/badges should have "2px borders, pill-rounded." The agent badge violates this.

## Where

- `frontend/prompts.html` line 60-63

## Fix

Add border to `.prompt-agent`:
```css
.prompt-agent {
  font-family: var(--font-mono); font-size: 9px; padding: 2px 8px;
  border-radius: 8px; white-space: nowrap;
  border: 2px solid var(--ink);  /* ADD THIS */
}
```

## Why this matters

Two badges sitting next to each other — one with a chunky border, one without — breaks the sticker aesthetic. Every badge should feel "slapped on."
