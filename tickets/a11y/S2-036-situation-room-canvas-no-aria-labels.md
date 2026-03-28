---
id: S2-036
severity: S2
category: a11y
title: Situation Room pixel canvas has no ARIA labels or screen reader description
source: deep-audit
status: closed-false-positive
---

## FALSE POSITIVE

Investigation found that the canvas ALREADY has a detailed `aria-label` at `frontend/agents.html:1652`:

```html
aria-label="Situation Room pixel canvas. Arrow keys or WASD to move camera. Keys 1-6 to select agents. Click to select. Drag to pan."
```

The canvas has keyboard instructions and interaction descriptions for screen readers. No fix needed.
