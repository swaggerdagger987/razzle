---
id: DQ-182
priority: P2
category: design-tokens/css
status: open
cycle: 27
---

# lab-panels.css `#b8860b` and `#a0522d` hardcoded rank colors — no CSS variable

## What's wrong

The Trade Value panel's top-ranked player text uses raw hex colors with no CSS variable. These colors have no dark mode overrides and bypass the design token system.

- `#b8860b` (dark goldenrod) for the #1 rank
- `#a0522d` (sienna) for the #3 rank

## Where

| File | Line | Selector | Current |
|------|------|----------|---------|
| `frontend/lab-panels.css` | 603 | `.tv-rank.top1` | `color: #b8860b` |
| `frontend/lab-panels.css` | 605 | `.tv-rank.top3` | `color: #a0522d` |

Note: `.tv-rank.top2` correctly uses `color: var(--ink-light)`.

## Fix

Option A: Use existing semantic variables:
```css
.tv-rank.top1 { color: var(--medal-gold); font-size: 16px; }
.tv-rank.top3 { color: var(--medal-bronze); font-size: 15px; }
```

Option B: If `--medal-gold` is too bright for text, add text-specific tokens:
```css
:root {
  --medal-gold-text: #b8860b;
  --medal-bronze-text: #a0522d;
}
[data-theme="dark"] {
  --medal-gold-text: #ffd700;
  --medal-bronze-text: #cd7f32;
}
```

## Test

1. Open Trade Values panel — #1 rank should be gold text, #3 bronze text.
2. Toggle dark mode — colors should remain readable and warm.
