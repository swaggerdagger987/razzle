# DES-323: warroom.js STATE_COLORS fallback '#666' — cold gray violation

**Priority**: P2
**Area**: warroom.js (line 1374)
**Cycle**: 30

## Problem

The agent state indicator in the Situation Room uses a cold gray fallback:

```javascript
style="background:${STATE_COLORS[a.state] || '#666'}"
```

`#666` is a neutral cold gray — DESIGN.md explicitly bans cold grays: "even dark mode stays warm (brown, not gray)."

This fallback fires when an agent's state doesn't match any key in STATE_COLORS. While rare at runtime, the fallback color should still be on-brand.

## Fix

Replace `'#666'` with a warm espresso equivalent:

```javascript
style="background:${STATE_COLORS[a.state] || 'var(--ink-light)'}"
```

Or if this is canvas/pixel context where CSS vars don't work:

```javascript
style="background:${STATE_COLORS[a.state] || '#8a7565'}"
```

`#8a7565` (ink-light) is the warm brown equivalent of `#666`.

## Why This Matters

Cold grays are the most common way the Razzle design system leaks. Every `#666`, `#999`, `#ccc` creates a tiny moment where the warm sand/espresso aesthetic breaks. This one is in the Situation Room — the premium feature surface.
