---
id: S2-087
severity: S2
confidence: HIGH
category: performance
source: DQ-319
status: OPEN
---

# Warroom sprites 30 images eagerly loaded without lazy loading

## Root Cause

`frontend/warroom.js:140-156`:

```javascript
Object.entries(AGENT_SPRITES).forEach(([agentKey, prefix]) => {
  spriteSheets[agentKey] = {};
  ANIM_TYPES.forEach(anim => {
    const img = new Image();
    img.onload = () => { spritesLoaded++; };
    img.src = `assets/characters/${prefix}-${anim}.png`;
    spriteSheets[agentKey][anim] = img;
  });
});
```

This loads 6 agents x 4 animation types = 24 sprite sheets immediately on page init. Plus 6 legacy sprites at lines 151-156. Total: 30 Image() requests (~32MB of PNGs).

No IntersectionObserver. No deferred loading. Sprites load even if:
- User hasn't scrolled to the canvas
- User is on the agents.html pricing section above the fold
- User is on mobile with limited bandwidth

## Fix

1. Lazy-load sprites via IntersectionObserver on the canvas element
2. Load only idle sprites initially; load attack/walk on state transition
3. Consider WebP conversion (30-40% smaller)

## Files

- `frontend/warroom.js:140-156` — sprite loading
- `frontend/warroom.js:151-156` — legacy sprite fallback

## Acceptance Criteria

- Sprites load only when canvas enters viewport
- Idle sprites load first, other animation states load on demand
- agents.html above-fold renders without waiting for sprite downloads
