---
id: DQ-249
priority: P3
category: tokens
page: agents.html
---

# Canvas waitAndStart() loading screen uses hardcoded hex

## What's wrong
In `warroom.js`, the `waitAndStart()` function draws the loading screen directly on canvas with hardcoded colors:

```javascript
ctx.fillStyle = '#2d1f14';  // should read CSS var --bg-ink or --ink
ctx.fillRect(0, 0, cvs.width, cvs.height);
ctx.fillStyle = '#d97757';  // should read CSS var --orange
ctx.font = 'bold 14px monospace';
ctx.fillText('pulling film...', cvs.width / 2, cvs.height / 2);
```

These happen to be the correct espresso and terracotta values, but they're not reading from CSS variables. If the design tokens change, this loading screen won't update.

## Fix
Use `getComputedStyle` to read the CSS vars, consistent with how `getCanvasTheme()` works elsewhere in the codebase:

```javascript
const style = getComputedStyle(document.documentElement);
ctx.fillStyle = style.getPropertyValue('--bg-ink').trim() || '#2d1f14';
ctx.fillStyle = style.getPropertyValue('--orange').trim() || '#d97757';
```

## Files
- `frontend/warroom.js` — `waitAndStart()` function (~line 4145)
