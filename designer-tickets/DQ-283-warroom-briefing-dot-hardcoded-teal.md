---
id: DQ-283
priority: P2
category: hardcoded color
status: open
---

# DQ-283: warroom.js briefing-card-dot hardcodes #2ec4b6 teal hex

## Problem

DESIGN.md: colors should use CSS variables, not hardcoded hex. Line 4041 of warroom.js creates a demo briefing card with a hardcoded teal color for the agent dot:

```javascript
'<span class="briefing-card-dot" style="background:#2ec4b6"></span>'
```

This is the Scout (Hawkeye) agent color. Other briefing card dots dynamically use the agent's color property, but this demo card hardcodes the hex. If the Scout color changes in the design system or agent definition, this dot won't update.

## Where

`frontend/warroom.js:4041`

## Fix

The agent color should come from the agent data, not be hardcoded. Two options:

**Option A** (quick): Replace `#2ec4b6` with `var(--pos-rb)` since Scout uses teal/green.

**Option B** (correct): Reference the DEMO_AGENTS array or look up the agent color dynamically:
```javascript
'<span class="briefing-card-dot" style="background:' + (DEMO_AGENTS.find(a => a.name === 'Hawkeye')?.color || 'var(--green)') + '"></span>'
```

Option A is the 1-line fix. Option B is the correct architectural fix.

## Not a dupe of

No existing ticket covers hardcoded hex in briefing card dot specifically.
