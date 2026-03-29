---
id: S3-117
severity: S3
category: mobile
title: Situation Room pixel canvas renders at ~342x251px on mobile — agents barely visible
source: deep-audit (Phase 6 mobile concerns table)
status: open
---

## Problem

The War Room pixel canvas is 960x704 native resolution (15 cols x 11 rows x 64px tiles). On a 390px mobile viewport, after 48px of padding from `.warroom-canvas-wrap`, the canvas renders at approximately 342x251 CSS pixels. The pixel agents (drawn at 64x96) appear as ~23x34px on screen — barely visible and hard to tap.

The responsive CSS is well-implemented (`aspect-ratio: 15/11`, `width: 100%`, `image-rendering: pixelated`), so this is not a bug — the canvas scales correctly. But the UX is poor: agents are too small to distinguish, touch targets are below 44px minimum, and the "click to select agent" interaction is nearly impossible.

## Root Cause

**`frontend/agents.html:257-273`**:
```css
.canvas-container {
  aspect-ratio: 15 / 11;
  max-height: 704px;
}
.canvas-container canvas {
  width: 100%;
  height: 100%;
}
```

**`frontend/warroom.js:8-12`**:
```javascript
const TILE = 64;
const COLS = 15;
const ROWS = 11;
const WORLD_W = COLS * TILE;  // 960
const WORLD_H = ROWS * TILE;  // 704
```

No mobile-specific UX adaptations exist. The canvas just scales down uniformly.

## Fix Options

1. **Fullscreen toggle** — Add a "fullscreen" button that expands the canvas to viewport width/height on mobile (landscape encouraged)
2. **Pinch-to-zoom** — Allow touch zoom gestures on the canvas (requires touch event handling in warroom.js)
3. **Hide canvas on mobile** — Replace with a static preview image and "Open on desktop for full experience" message
4. **Agent list below canvas** — On mobile, add tappable agent cards below the canvas that select agents without needing to tap tiny sprites

Option 3 is simplest. Option 1 gives the best experience.

## Accept When

- On 390px viewport, users can either interact meaningfully with the pixel canvas OR see a clear mobile alternative
- Touch targets for agent selection meet 44px minimum
