---
id: DQ-132
priority: P2
area: design-system
section: color-tokens
type: token-violation
status: open
---

# Agent config uses non-standard hex colors not in DESIGN.md

## What's wrong

`agent-config.js` defines two agent colors that are NOT in the DESIGN.md palette:

- **Octo** (line 94): `#e87422` — a bright burnt orange, not `--orange` (#d97757)
- **Atlas** (line 122): `#d44040` — a muted red, not `--red` (#e63946)

These colors appear on agent badges, briefing cards, and Situation Room UI. They break the 6-color accent system.

## Where

- `frontend/agent-config.js` lines 94, 122

## Fix

```js
// Octo: use --orange (#d97757) or read from CSS var
color: "#d97757",  // was #e87422

// Atlas: use --red (#e63946) or read from CSS var
color: "#e63946",  // was #d44040
```

Alternatively, if the agents NEED distinct colors beyond the 4 position colors, add these as named tokens in DESIGN.md and styles.css `:root`.

## Why this matters

Every non-standard color weakens the design system. When 4 agents use palette colors and 2 don't, the Situation Room feels like two different designers built it.
