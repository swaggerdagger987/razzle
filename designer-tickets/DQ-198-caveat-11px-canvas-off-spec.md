---
id: DQ-198
priority: P3
category: typography
status: open
---

# DQ-198: 11px Caveat on canvas — unreadable, off Caveat type scale

## Problem

DESIGN.md Caveat sizes: 24px (handwritten annotations), 18px (card scribbles). 11px Caveat is:
1. Not in the type scale for Caveat
2. Unreadable — Caveat is a handwriting font that becomes illegible below ~14px

In `charts.js` line 770:
```javascript
ctx.font = "11px 'Caveat', cursive";
```

This renders a label inside a chart visualization at 11px Caveat. At this size, the handwriting strokes blur together.

## Fix

If this is a data label, switch to Space Mono (data font):
```javascript
ctx.font = "11px 'Space Mono', monospace";
```

If this is an annotation, increase to 18px Caveat:
```javascript
ctx.font = "18px 'Caveat', cursive";
```

## Scope

1 edit in `frontend/charts.js` line 770.
