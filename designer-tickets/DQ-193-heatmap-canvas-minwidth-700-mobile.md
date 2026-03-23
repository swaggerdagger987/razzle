---
id: DQ-193
priority: P2
category: mobile
status: open
---

# DQ-193: Heatmap canvas forces 700px minimum width — poor mobile UX

## Problem

In `charts.js` line 28:
```javascript
canvas.style.minWidth = "700px";
```

When the heatmap tab is active, the canvas element gets `minWidth: 700px` even on 375px mobile screens. While the canvas is wrapped in `overflow-x: auto`, this forces horizontal scroll for a 700px chart on a phone — poor UX for the most data-dense visualization.

## Fix

Add a viewport check before setting minWidth, or use a CSS media query override:

```javascript
// Option A: JS guard
if (window.innerWidth > 768) {
  canvas.style.minWidth = "700px";
}

// Option B: CSS override in lab.html <style>
@media (max-width: 768px) {
  #chartCanvas { min-width: auto !important; }
}
```

## Scope

1 line in `frontend/charts.js` line 28, plus optional CSS override in `frontend/lab.html`.
