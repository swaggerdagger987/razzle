---
id: DQ-194
priority: P2
category: typography
status: open
---

# DQ-194: 28px Caveat used as canvas section titles — violates "Caveat never primary info"

## Problem

DESIGN.md rule: "Caveat is never primary information. Always a comment, aside, margin note."

8 files use `ctx.font = '28px Caveat'` (or `'600 28px Caveat'`) to render **section titles** on canvas — the most prominent text on the visualization:

| File | Line | Context |
|------|------|---------|
| `aging.html` | 780 | Chart title |
| `app.js` | 508 | Export watermark title |
| `breakouts.html` | 659 | Chart title |
| `buysell.html` | 742 | Chart title |
| `lab-panels.js` | 266 | Panel chart title |
| `lab.js` | 135 | Screener chart title |
| `scarcity.html` | 562 | Chart title |
| `usage.html` | 651 | Chart title |

These are primary information (chart titles), not annotations. AND 28px is off the Caveat type scale (should be 24px or 18px).

**Note**: DQ-078 covers CSS `font-size: 28px` in hero sections. This ticket covers **canvas `ctx.font`** which is a completely different code path.

## Fix

For chart titles on canvas, switch to Display font:
```javascript
ctx.font = "700 20px 'Luckiest Guy', cursive";
```

If Caveat personality is wanted, use the spec-compliant 24px:
```javascript
ctx.font = "600 24px 'Caveat', cursive";
```

## Scope

8 single-line edits across 8 files. Each line follows the same pattern.
