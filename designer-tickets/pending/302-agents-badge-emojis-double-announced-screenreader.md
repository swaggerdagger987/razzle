# DES-302: Agent badge emojis double-announced by screen readers

**Priority**: P2
**Category**: Accessibility
**Page**: agents.html
**Lines**: 1619-1624

## Problem

The 6 agent badges in the Situation Room hero use emoji + text name:

```html
<span class="agent-badge">🐯 Razzle</span>
<span class="agent-badge">🦅 Hawkeye</span>
<span class="agent-badge">🦊 Bones</span>
```

Screen readers announce both the emoji description AND the name: "tiger face Razzle", "eagle Hawkeye", "fox face Bones". This is redundant and confusing. The emoji is decorative — the text name IS the label.

**Note**: DES-006 (fixed) was about wrong emojis. This is about screen reader verbosity with correct emojis.

## Expected

```html
<span class="agent-badge"><span aria-hidden="true">🐯</span> Razzle</span>
```

The `aria-hidden="true"` on the emoji span prevents screen readers from announcing it, while keeping the visual decoration.

## Fix

Wrap each emoji in `<span aria-hidden="true">` across all 6 badges. 6 lines changed.
