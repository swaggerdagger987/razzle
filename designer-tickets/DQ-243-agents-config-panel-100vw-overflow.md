---
id: DQ-243
priority: P2
category: mobile
page: agents.html
---

# Mobile config panel `width: 100vw` causes horizontal scroll

## What's wrong
In `agents.html` at the `@media (max-width: 480px)` breakpoint (~line 1570):

```css
.config-panel {
  position: fixed;
  width: 100vw;      /* BUG: includes scrollbar width */
  max-width: 100vw;  /* also wrong */
  left: 0;
  right: 0;
  ...
}
```

`100vw` on a fixed element includes the browser scrollbar width, causing the panel to overflow by ~15px and triggering horizontal scroll. The `overflow-x: hidden` on `html, body` is a fragile workaround that breaks on iOS Safari.

## Fix
Remove `width: 100vw` and `max-width: 100vw`. The `left: 0; right: 0` declarations already stretch the panel to full width correctly:

```css
.config-panel {
  position: fixed;
  left: 0;
  right: 0;
  /* width and max-width removed */
  ...
}
```

## Files
- `frontend/agents.html` — `@media (max-width: 480px)` section (~line 1570)
