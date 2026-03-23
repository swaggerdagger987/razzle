---
id: DQ-159
priority: P2
area: dark-mode
section: agents-shadow
type: design-violation
status: open
---

# Agents page canvas container uses cold black rgba shadow instead of espresso

## What's wrong

The Situation Room pixel canvas container uses `box-shadow: 4px 4px 0 rgba(0,0,0,0.4)` — a cold black shadow that violates the espresso ink design system. On the sand background, this reads as blue-black instead of warm brown. On dark mode, a black shadow on dark espresso background is nearly invisible.

## Where

- `frontend/agents.html:259` — `.canvas-container { box-shadow: 4px 4px 0 rgba(0,0,0,0.4); }`

Previous ticket DQ-061 covered `agents-cold-black-rgba-shadows` broadly but this specific instance at line 259 was added in commit `135c614f` (2026-03-22) AFTER the DQ-061 fix pass, making it a regression.

## Fix

Replace:
```css
box-shadow: 4px 4px 0 rgba(0,0,0,0.4);
```
With:
```css
box-shadow: 4px 4px 0 var(--ink);
```

## Why it matters

The Situation Room is the hero feature — the canvas container is the centerpiece. A cold black shadow breaks the warm espresso aesthetic that defines every other element on the page.
