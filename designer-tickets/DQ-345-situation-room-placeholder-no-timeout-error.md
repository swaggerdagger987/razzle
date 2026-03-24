---
id: DQ-345
title: Situation Room canvas placeholder has no timeout or error state
priority: P2
category: UX / error handling
page: agents.html
cycle: 45
---

## Problem

The Situation Room pixel canvas shows a placeholder (line 1654-1658) while warroom.js initializes:
```html
<div class="canvas-placeholder" id="canvasPlaceholder">
    <div class="canvas-placeholder-icon">🐯</div>
    <div class="canvas-placeholder-text">agents are setting up the Situation Room...</div>
    <div class="canvas-placeholder-sub">pulling up the Situation Room feed</div>
</div>
```

If warroom.js fails to load (network error, CDN down, JS exception), this placeholder stays visible FOREVER with no indication that something went wrong. Users see "agents are setting up..." indefinitely.

warroom.js hides the placeholder only on successful initialization. There is no fallback timeout or error message.

## Expected

After 10 seconds, if the canvas hasn't initialized, replace the placeholder text with an error state:
"Situation Room is offline. Try refreshing the page."

## Fix

Add a timeout in agents.html after the canvas container:
```javascript
setTimeout(function() {
    var p = document.getElementById('canvasPlaceholder');
    if (p && p.style.display !== 'none') {
        p.querySelector('.canvas-placeholder-text').textContent = 'Situation Room is offline.';
        p.querySelector('.canvas-placeholder-sub').textContent = 'try refreshing the page';
    }
}, 10000);
```

## Files
- `frontend/agents.html` (lines 1654-1658)
