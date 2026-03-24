---
id: DQ-382
title: posColor + "40" alpha concatenation produces invalid CSS in dark mode
priority: P1
category: functional bug / dark mode
page: lab.js (boom/bust + comp finder)
status: open
cycle: 50
---

## Problem

Two canvas functions append `"40"` to position color strings to create semi-transparent fills:

```javascript
ctx.fillStyle = posColor + "40";
```

This assumes `posColor` is always a 6-digit hex string (e.g., `"#5b7fff"` → `"#5b7fff40"`). But `getCanvasTheme()` may return different formats in dark mode or future refactors. If posColor is an `rgb()` value (e.g., `"rgb(91, 127, 255)"`), concatenation produces `"rgb(91, 127, 255)40"` — invalid CSS, rendering nothing.

## Evidence

- `lab.js:12864` — `ctx.fillStyle = posColor + "40";` (boom/bust range bar background)
- `lab.js:13088` — `ctx.fillStyle = posColor + "40";` (boom/bust export)

## Fix

Create a safe alpha helper or use explicit rgba conversion:

```javascript
function withAlpha(hex, alpha) {
  // Ensure hex format, append alpha byte
  if (hex.startsWith('#') && hex.length === 7) return hex + alpha;
  // Fallback: parse rgb
  const m = hex.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (m) return `rgba(${m[1]},${m[2]},${m[3]},${parseInt(alpha,16)/255})`;
  return hex; // unchanged if unparseable
}

ctx.fillStyle = withAlpha(posColor, "40");
```

Or use the existing theme's light tint variant if available.

## Verification

1. Switch to dark mode
2. Open Lab → Boom/Bust panel → select a player
3. Range bar background fill should be visible (semi-transparent position color)
4. Check browser console for no invalid CSS warnings
