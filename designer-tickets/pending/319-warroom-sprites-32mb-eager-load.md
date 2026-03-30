# DES-319: Character sprites load 32MB eagerly on warroom.js init

**Priority**: P1
**Area**: warroom.js (lines 143-156)
**Cycle**: 30

## Problem

The Situation Room loads ~30 character sprite PNG files via `new Image()` on page init. The sprite sheets range from 850KB to 1.5MB each (quant-idle.png = 1.5MB, historian-attack.png = 1.4MB, scout-attack.png = 1.4MB, razzle-idle.png = 1.1MB).

Total: ~32MB of PNG sprites loaded immediately, even if:
- The user hasn't scrolled to the Situation Room canvas
- The user is on the agents.html pricing section above the canvas
- The user is on mobile with limited bandwidth

### Current code (warroom.js ~line 143):

```javascript
const img = new Image();
img.onload = () => { spritesLoaded++; };
img.src = `assets/characters/${prefix}-${anim}.png`;
spriteSheets[agentKey][anim] = img;
```

This runs for every agent × every animation state on page load.

## Fix

1. **Lazy-load sprites**: Only start loading when the canvas element enters the viewport (IntersectionObserver)
2. **Load idle first**: Load only idle sprites initially. Load attack/walk when the agent actually enters that state.
3. **Consider WebP**: Convert PNG sprites to WebP (30-40% smaller on average)

### Lazy-load example:

```javascript
const observer = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    loadSprites();
    observer.disconnect();
  }
});
observer.observe(document.getElementById('game-canvas'));
```

## Why This Matters

The Situation Room is the Elite conversion surface. Users on mobile (62%+ of traffic from Twitter/Reddit) must download 32MB before seeing the premium feature that's supposed to convince them to upgrade. This is the single largest performance bottleneck on the site.
