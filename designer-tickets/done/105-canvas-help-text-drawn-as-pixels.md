# DES-105: Pixel canvas help text drawn as pixels, not in DOM

**Priority**: P2
**Area**: warroom.js (~line 1269), agents.html (~line 1643)
**Cycle**: 10

## Problem

The Situation Room pixel canvas draws keyboard shortcut help text ("Arrow keys: move | 1-6: select agent | Click: select | Drag: pan") directly onto the canvas using `ctx.fillText()`. This text:

1. **Is invisible to screen readers** — canvas pixel data has no text equivalent
2. **Disappears on interaction** — gets painted over when agents move or user drags
3. **Can't be read at high zoom** — canvas doesn't scale like DOM text
4. **Doesn't persist** — only shown on initial load, then gone

The canvas also has `aria-label="Click an agent to select them"` which mentions clicking but not the keyboard shortcuts (1-6 keys, arrow keys, WASD).

## Fix

1. Add a visible DOM help line below the canvas in agents.html:

```html
<p class="war-room-help" style="font-family:var(--font-mono);font-size:12px;color:var(--ink-light);text-align:center;margin:8px 0 0;">
  Arrow keys: move &middot; 1-6: select agent &middot; Click: select &middot; Drag: pan
</p>
```

2. Update the canvas aria-label to include keyboard info:

```html
aria-label="Situation Room pixel canvas. Arrow keys or WASD to move camera. Keys 1-6 to select agents. Click to select. Drag to pan."
```

3. Remove the `ctx.fillText()` call in warroom.js (~line 1269) that draws help text on the canvas — the DOM element replaces it.

## Why This Matters

The Situation Room is the premium product that Pro/Elite users pay for. The pixel canvas is its centerpiece. Users who can't see the canvas (screen reader users) or who miss the initial help text (everyone after 2 seconds) don't know how to interact with it. The keyboard shortcuts (1-6 agent selection) are actually excellent accessibility — they just need to be discoverable.
