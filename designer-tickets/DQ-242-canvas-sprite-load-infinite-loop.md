---
id: DQ-242
priority: P2
category: ux-bug
page: agents.html
---

# Canvas sprite-load has no timeout — "pulling film..." loops forever

## What's wrong
In `warroom.js`, the `waitAndStart()` function (line ~4145) uses `requestAnimationFrame` to poll `spritesLoaded >= TOTAL_SPRITES_NEEDED` (24 sprites). If ANY sprite image 404s or fails to load, `spritesLoaded` never reaches 24, and the canvas shows "pulling film..." with animated dots forever. No timeout. No fallback. No error message.

## Why it matters
Sprite images live at `assets/characters/char_0.png` through `char_5.png`. If these fail to load (CDN issue, slow connection, ad blocker), the Situation Room pixel canvas is permanently broken with no user feedback. The user thinks the page is loading when it's actually dead.

## Fix
Add a 10-second timeout to `waitAndStart()`:
```javascript
const SPRITE_TIMEOUT = 10000;
const spriteLoadStart = performance.now();

function waitAndStart() {
  if (spritesLoaded >= TOTAL_SPRITES_NEEDED) {
    // ... existing start logic
  } else if (performance.now() - spriteLoadStart > SPRITE_TIMEOUT) {
    // Timeout fallback
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) {
      placeholder.innerHTML = '<div class="canvas-placeholder-text">pixel canvas couldn\'t load — sprites missing</div>';
      placeholder.style.display = 'flex';
    }
  } else {
    // ... existing loading animation
    _rafId = requestAnimationFrame(waitAndStart);
  }
}
```

## Files
- `frontend/warroom.js` — `waitAndStart()` function (~line 4145)
