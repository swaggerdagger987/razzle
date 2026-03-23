---
id: DES-208
title: Demo briefing card text ~2:1 contrast on bg-ink in light mode
priority: P1
category: accessibility
page: index.html
agent: Razzle
created: 2026-03-23
cycle: 20
---

## What's wrong

The Situation Room demo briefing cards on the home page use `color: var(--ink-medium)` (#5c4a3d) on `background: var(--bg-ink)` (#1a110a). In light mode, both colors are dark brown. Estimated contrast ratio is ~2:1, far below WCAG AA minimum of 4.5:1.

In dark mode, `--ink-medium` flips to `#c4b5a5` (light sand), giving adequate contrast. But light mode (the default) is broken.

## Evidence

- `.demo-card` defined at index.html line ~284: `background: var(--bg-ink); color: var(--ink-medium);`
- `--bg-ink` = `#1a110a` (deepest espresso, NEVER changes between modes)
- `--ink-medium` in light mode = `#5c4a3d` (dark brown)
- Result: dark brown text on very dark brown background — nearly invisible

## Why it matters

These demo cards sell the Situation Room premium product. They show what AI agent briefings look like. If the text is unreadable on the default theme, the #1 upsell preview fails. First-time visitors from Reddit/Twitter see light mode.

## Fix

Use a light text color that works on `--bg-ink` regardless of theme. Options:

1. Use `color: #c4b5a5` (the dark-mode value of `--ink-medium`) — works on dark bg in both modes
2. Add a dedicated CSS variable `--text-on-dark` for text on always-dark backgrounds
3. Use `color: var(--ink-faint)` which is `#c4b5a5` in light mode — close enough contrast

Option 1 is simplest. The `.agent-name` already uses `color: var(--yellow)` which works on dark bg.

## Scope

index.html `.demo-card` rule, line ~292. 1 CSS property change.
