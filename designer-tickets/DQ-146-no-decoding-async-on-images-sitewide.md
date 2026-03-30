---
id: DQ-146
priority: P3
area: performance
section: images
type: perf-optimization
status: open
---

# No decoding="async" on images (0 instances, 38 img tags)

## What's wrong

`decoding="async"` allows the browser to decode images off the main thread, preventing image decode from blocking page rendering. Zero of the 38 `<img>` tags across 23 HTML files use this attribute. All image decodes happen synchronously, which can cause frame drops during page load.

## Where

- 0 instances of `decoding="async"` in any frontend file
- 38 `<img>` tags across 23 HTML files
- 8 JS-created images (`new Image()`, `createElement('img')`) in app.js, lab.js, warroom.js

## Fix

Add `decoding="async"` to all `<img>` tags that aren't the LCP hero image:

```html
<img src="/assets/agents/bones.svg" width="16" height="16" alt="Bones" decoding="async" loading="lazy">
```

For JS-created images, add after creation:
```js
img.decoding = 'async';
```

**Exception:** The LCP image (if identified) should use `decoding="sync"` or omit the attribute to ensure it renders ASAP.

## Why this matters

Without async decoding, every image decode blocks the main thread. With 9+ sidebar agent icons in lab.html alone, this creates a decode queue that can delay interactive time by 100ms+ on slower devices.
