---
id: DQ-227
title: Display toggle buttons (Pctl, Dense, Groups, Diff, Top3) lack title/tooltip attributes
priority: P2
category: ux-discoverability
status: open
cycle: 32
---

## Problem

The Lab's display toggle buttons use abbreviations that assume deep product familiarity:
- **Pctl** — Percentile coloring (not obvious)
- **Dense** — Compact table rows (unclear)
- **Groups** — Column group headers (could mean anything)
- **Diff** — Diff vs pinned player (jargon)
- **Top3** — Stat leader indicators (requires context)
- **SOS** — Strength of Schedule (league term)

None of these buttons have `title` attributes or tooltip hover text. A first-time user has to click each one to discover what it does, which is a poor onboarding experience.

This is DIFFERENT from DQ-095 (placeholder text in input fields). These are button labels, not input placeholders.

## Evidence

- `frontend/lab.html:3386-3396` — Settings panel toggle buttons
- No `title="..."` attributes on any toggle

## Fix

Add title attributes to each toggle button:
```html
<button title="Percentile heat coloring on stats">Pctl</button>
<button title="Compact table rows">Dense</button>
<button title="Show column group headers (Passing, Rushing, etc.)">Groups</button>
<button title="Show diff vs pinned player">Diff</button>
<button title="Highlight top 3 values per column">Top3</button>
```

5-second fix per button. Zero risk.

## Files
- `frontend/lab.html` (settings panel section)
