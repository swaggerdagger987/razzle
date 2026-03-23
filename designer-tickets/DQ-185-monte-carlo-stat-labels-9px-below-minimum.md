---
id: DQ-185
priority: P2
category: typography/type-scale
status: open
cycle: 27
---

# league-intel.html Monte Carlo stat labels 9px — below 11px type scale minimum

## What's wrong

The Monte Carlo simulation results show championship %, playoff %, and average points with labels at `font-size:9px`. DESIGN.md type scale minimum is 11px. At 9px, these labels are:
- Nearly unreadable on mobile
- Below WCAG minimum recommended text size
- Off the type scale (smallest allowed is 11px for uppercase labels)

## Where

All 3 instances are in the Monte Carlo results rendering JS:

| Line | Label text | Current |
|------|-----------|---------|
| 6357 | "CHAMP" | `font-family:var(--font-mono);font-size:9px;color:var(--ink-light)` |
| 6358 | "PLAYOFF" | Same |
| 6359 | "AVG PTS" | Same |

## Code

```javascript
html += '<div style="font-family:var(--font-mono);font-size:9px;color:var(--ink-light);">CHAMP</div>';
html += '<div style="font-family:var(--font-mono);font-size:9px;color:var(--ink-light);">PLAYOFF</div>';
html += '<div style="font-family:var(--font-mono);font-size:9px;color:var(--ink-light);">AVG PTS</div>';
```

## Fix

Increase to 11px (type scale minimum for uppercase labels):
```javascript
'font-size:11px;'
```

Also consider extracting to a CSS class:
```css
.mc-stat-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-light);
}
```

## Test

1. Connect Sleeper, open a league, run Monte Carlo sim.
2. "CHAMP", "PLAYOFF", "AVG PTS" labels should be readable at 11px.
3. Labels should still fit within the stat card layout (may need to abbreviate if tight).
